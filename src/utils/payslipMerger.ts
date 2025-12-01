// Utility for merging payslip documents into a single PDF
import { jsPDF } from 'jspdf';

export const mergePayslips = async (payslip1: File, payslip2: File, payslip3: File, clientNRC: string): Promise<File> => {
  const pdf = new jsPDF();
  let pageAdded = false;

  const addFileToPDF = async (file: File, pageNumber: number) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const result = e.target?.result;
          
          if (file.type === 'application/pdf') {
            // For PDF files, we'll add a text placeholder since direct PDF merging
            // requires more complex libraries. In production, use pdf-lib or similar.
            if (pageAdded) pdf.addPage();
            pdf.setFontSize(16);
            pdf.text(`Payslip ${pageNumber}`, 20, 30);
            pdf.setFontSize(10);
            pdf.text(`Original file: ${file.name}`, 20, 50);
            pdf.text(`File size: ${Math.round(file.size / 1024)} KB`, 20, 60);
            pdf.text(`Note: PDF content preserved in original file`, 20, 70);
            pageAdded = true;
            resolve();
          } else if (file.type.startsWith('image/')) {
            // For image files, add them directly to the PDF with compression
            if (pageAdded) pdf.addPage();
            
            const img = new Image();
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Canvas context not available');
                
                // Calculate dimensions to fit page
                const pageWidth = 190; // A4 width minus margins
                const pageHeight = 270; // A4 height minus margins
                const imgRatio = img.width / img.height;
                const pageRatio = pageWidth / pageHeight;
                
                let pdfWidth, pdfHeight;
                if (imgRatio > pageRatio) {
                  pdfWidth = pageWidth;
                  pdfHeight = pageWidth / imgRatio;
                } else {
                  pdfHeight = pageHeight;
                  pdfWidth = pageHeight * imgRatio;
                }
                
                // Optimize canvas size - use max 1200px width for compression
                const maxWidth = 1200;
                const maxHeight = 1200;
                let canvasWidth = img.width;
                let canvasHeight = img.height;
                
                if (canvasWidth > maxWidth || canvasHeight > maxHeight) {
                  const scale = Math.min(maxWidth / canvasWidth, maxHeight / canvasHeight);
                  canvasWidth = Math.floor(canvasWidth * scale);
                  canvasHeight = Math.floor(canvasHeight * scale);
                }
                
                // Set canvas to optimized size
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                
                // Draw scaled image
                ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
                
                // Convert to JPEG with compression (0.7 quality)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                pdf.addImage(dataUrl, 'JPEG', 10, 10, pdfWidth, pdfHeight);
                pdf.setFontSize(8);
                pdf.text(`Payslip ${pageNumber}`, 10, pdfHeight + 20);
                
                pageAdded = true;
                resolve();
              } catch (error) {
                reject(error);
              }
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = result as string;
          } else {
            // For other file types, add metadata
            if (pageAdded) pdf.addPage();
            pdf.setFontSize(16);
            pdf.text(`Payslip ${pageNumber}`, 20, 30);
            pdf.setFontSize(10);
            pdf.text(`Original file: ${file.name}`, 20, 50);
            pdf.text(`File type: ${file.type}`, 20, 60);
            pdf.text(`File size: ${Math.round(file.size / 1024)} KB`, 20, 70);
            pdf.text(`Note: Original file content preserved`, 20, 80);
            pageAdded = true;
            resolve();
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  try {
    // Add title page
    pdf.setFontSize(20);
    pdf.text('Combined Payslips', 20, 30);
    pdf.setFontSize(12);
    pdf.text(`Client NRC: ${clientNRC}`, 20, 50);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 60);
    pdf.setFontSize(10);
    pdf.text('This document contains three consecutive payslips:', 20, 80);
    pdf.text('1. Oldest payslip', 30, 90);
    pdf.text('2. Middle payslip', 30, 100);
    pdf.text('3. Most recent payslip', 30, 110);
    pageAdded = true;

    // Add each payslip
    await addFileToPDF(payslip1, 1);
    await addFileToPDF(payslip2, 2);
    await addFileToPDF(payslip3, 3);

    // Generate the merged PDF
    const pdfBlob = pdf.output('blob');
    const sanitizedNRC = clientNRC.replace(/[^\w]/g, '');
    const mergedFile = new File([pdfBlob], `Combined_Payslips_${sanitizedNRC}.pdf`, {
      type: 'application/pdf'
    });

    return mergedFile;
  } catch (error) {
    console.error('Error merging payslips:', error);
    throw new Error('Failed to merge payslips');
  }
};