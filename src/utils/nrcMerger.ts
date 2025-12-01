// Utility for merging NRC front and back images into a single PDF
import { jsPDF } from 'jspdf';

export const mergeNRCImages = async (nrcFront: File, nrcBack: File, clientNRC: string): Promise<File> => {
  const pdf = new jsPDF();
  let pageAdded = false;

  const addImageToPDF = async (file: File, pageLabel: string) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const result = e.target?.result;
          
          if (file.type.startsWith('image/')) {
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
                
                // Convert to JPEG with compression (0.7 quality = good balance)
                const imgData = canvas.toDataURL('image/jpeg', 0.7);
                pdf.addImage(imgData, 'JPEG', 10, 10, pdfWidth, pdfHeight);
                
                // Add label
                pdf.setFontSize(10);
                pdf.setTextColor(100);
                pdf.text(`${pageLabel}`, 10, pdfHeight + 20);
                
                pageAdded = true;
                resolve();
              } catch (err) {
                reject(err);
              }
            };
            
            img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
            
            if (typeof result === 'string') {
              img.src = result;
            } else {
              reject(new Error('Invalid file data'));
            }
          } else if (file.type === 'application/pdf') {
            // For PDF files, add a placeholder page
            if (pageAdded) pdf.addPage();
            pdf.setFontSize(16);
            pdf.text(pageLabel, 20, 30);
            pdf.setFontSize(10);
            pdf.text(`Original file: ${file.name}`, 20, 50);
            pdf.text(`File size: ${Math.round(file.size / 1024)} KB`, 20, 60);
            pdf.text(`Note: PDF content preserved in original file`, 20, 70);
            pageAdded = true;
            resolve();
          } else {
            reject(new Error(`Unsupported file type: ${file.type}`));
          }
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  try {
    // Add NRC Front
    await addImageToPDF(nrcFront, 'NRC Front');
    
    // Add NRC Back
    await addImageToPDF(nrcBack, 'NRC Back');
    
    // Generate PDF blob
    const pdfBlob = pdf.output('blob');
    
    // Create File object with descriptive name
    const timestamp = Date.now();
    const fileName = `NRC_Combined_${clientNRC}_${timestamp}.pdf`;
    
    return new File([pdfBlob], fileName, { type: 'application/pdf' });
  } catch (error) {
    console.error('Error merging NRC images:', error);
    throw error;
  }
};
