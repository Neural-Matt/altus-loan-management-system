// Utility for generating a comprehensive PDF summary of the loan application
import { jsPDF } from 'jspdf';

interface ApplicationSummaryData {
  customer: any;
  loan: any;
  documents: Array<{
    type: string;
    status?: string;
    notes?: string;
  }>;
  readiness: any;
  generatedAt: string;
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
};

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) ? `ZMW ${num.toLocaleString()}` : String(amount);
};

export const generateApplicationPDF = (data: ApplicationSummaryData): File => {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;

  // Helper function to add text with automatic page breaks
  const addText = (text: string, x: number, fontSize: number = 10, isBold: boolean = false) => {
    pdf.setFontSize(fontSize);
    if (isBold) {
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setFont('helvetica', 'normal');
    }
    
    // Check if we need a new page
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.text(text, x, yPosition);
    yPosition += fontSize * 0.5 + 2;
  };

  const addSection = (title: string) => {
    yPosition += 5;
    addText(title, margin, 14, true);
    yPosition += 2;
  };

  const addField = (label: string, value: string) => {
    addText(`${label}: ${value}`, margin + 5, 10);
  };

  // Header
  pdf.setFillColor(1, 26, 65); // #011A41
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ALTUS LOAN APPLICATION SUMMARY', margin, 25);
  
  pdf.setTextColor(0, 0, 0);
  yPosition = 50;

  // Generation info
  addText(`Generated: ${formatDate(data.generatedAt)}`, margin, 8);
  addText(`Application Status: ${data.readiness?.ok ? 'READY FOR SUBMISSION' : 'INCOMPLETE'}`, margin, 8, true);
  yPosition += 5;

  // Customer Information Section
  addSection('APPLICANT INFORMATION');
  
  if (data.customer) {
    addField('First Name', data.customer.firstName || 'Not provided');
    addField('Last Name', data.customer.lastName || 'Not provided');
    addField('NRC Number', data.customer.nrc || 'Not provided');
    addField('Phone Number', data.customer.phone || 'Not provided');
    addField('Email Address', data.customer.email || 'Not provided');
    addField('Residential Address', data.customer.address || 'Not provided');
    addField('Gender', data.customer.gender || 'Not provided');
    addField('Nationality', data.customer.nationality === 'Other' ? data.customer.otherNationality || 'Not provided' : data.customer.nationality || 'Not provided');
    addField('Occupation', data.customer.occupation || 'Not provided');
    addField('Marital Status', data.customer.maritalStatus || 'Not provided');
    addField('Accommodation Type', data.customer.accommodationType || 'Not provided');
    addField('Employer Name', data.customer.employerName || 'Not provided');
    addField('Employee/MAN Number', data.customer.payrollNumber || 'Not provided');
    addField('Purpose of Loan', data.customer.purpose || 'Not provided');
  }

  // Next of Kin Information
  if (data.customer?.nextOfKin) {
    yPosition += 5;
    addSection('NEXT OF KIN INFORMATION');
    const nok = data.customer.nextOfKin;
    addField('Full Name', `${nok.firstName || ''} ${nok.lastName || ''}`.trim() || 'Not provided');
    addField('Phone Number', nok.phone || 'Not provided');
    addField('Email Address', nok.email || 'Not provided');
    addField('Address', nok.address || 'Not provided');
    addField('NRC Number', nok.nrc || 'Not provided');
    addField('Nationality', nok.nationality || 'Not provided');
    addField('Relationship', nok.relationship || 'Not provided');
  }

  // Reference Information
  if (data.customer?.reference) {
    yPosition += 5;
    addSection('REFERENCE INFORMATION');
    const ref = data.customer.reference;
    addField('Name', ref.name || 'Not provided');
    addField('Phone Number', ref.phone || 'Not provided');
    addField('Email Address', ref.email || 'Not provided');
    addField('Address', ref.address || 'Not provided');
  }

  // Loan Details Section
  yPosition += 5;
  addSection('LOAN DETAILS');
  
  if (data.loan) {
    addField('Loan Amount', data.loan.amount ? formatCurrency(data.loan.amount) : 'Not specified');
    addField('Loan Tenure', data.loan.tenureMonths ? `${data.loan.tenureMonths} months` : 'Not specified');
    addField('Product Code', data.loan.productCode || 'Not specified');
    
    if (data.loan.emiResult) {
      const emi = data.loan.emiResult;
      addField('Monthly EMI', emi.monthlyEmi ? formatCurrency(emi.monthlyEmi) : 'Not calculated');
      addField('Total Interest', emi.totalInterest ? formatCurrency(emi.totalInterest) : 'Not calculated');
      addField('Total Amount Payable', emi.totalPayable ? formatCurrency(emi.totalPayable) : 'Not calculated');
      addField('Interest Rate', emi.interestRateAnnual ? `${emi.interestRateAnnual}% per annum` : 'Not specified');
    }
  }

  // Documents Section
  yPosition += 5;
  addSection('DOCUMENTS STATUS');
  
  if (data.documents && data.documents.length > 0) {
    data.documents.forEach(doc => {
      const docName = getDocumentDisplayName(doc.type);
      const status = doc.status || 'Not uploaded';
      const statusText = status.charAt(0).toUpperCase() + status.slice(1);
      addField(docName, statusText + (doc.notes ? ` (${doc.notes})` : ''));
    });
  } else {
    addText('No documents uploaded', margin + 5, 10);
  }

  // Application Readiness
  yPosition += 10;
  addSection('APPLICATION READINESS SUMMARY');
  
  if (data.readiness) {
    addField('Overall Status', data.readiness.ok ? 'READY FOR SUBMISSION' : 'REQUIRES ATTENTION');
    
    if (data.readiness.issues && data.readiness.issues.length > 0) {
      yPosition += 3;
      addText('Outstanding Issues:', margin + 5, 10, true);
      data.readiness.issues.forEach((issue: string) => {
        addText(`• ${issue}`, margin + 15, 9);
      });
    }
  }

  // Footer
  const pageHeight = pdf.internal.pageSize.height;
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text('This document is computer generated and contains confidential information.', margin, pageHeight - 20);
  pdf.text('Generated by Altus Loan Management System', margin, pageHeight - 12);

  // Generate file
  const pdfBlob = pdf.output('blob');
  const clientNRC = data.customer?.nrc ? String(data.customer.nrc).replace(/[^\w]/g, '') : 'Unknown';
  const fileName = `Altus_Loan_Application_${clientNRC}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  return new File([pdfBlob], fileName, { type: 'application/pdf' });
};

// Helper function to get readable document names
const getDocumentDisplayName = (type: string): string => {
  const names: Record<string, string> = {
    'nrc-front': 'National Registration Card',
    'nrc-back': 'NRC Back',
    'payslip-1': 'Payslip (Oldest)',
    'payslip-2': 'Payslip (Middle)',
    'payslip-3': 'Payslip (Recent)',
    'reference-letter': 'Application Form/Pre-Approval Form',
    'work-id': 'Work ID',
    'selfie': 'Applicant Photo',
    'bank-statement': 'Bank Statement',
    'combined-payslips': 'Combined Payslips Document'
  };
  return names[type] || type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};