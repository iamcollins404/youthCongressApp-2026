// Worker for generating ID cards
import html2canvas from 'html2canvas';
import JSZip from 'jszip';

self.onmessage = async (e) => {
  const { tickets, batchSize } = e.data;
  const zip = new JSZip();
  let processed = 0;

  try {
    // Process tickets in batches
    for (let i = 0; i < tickets.length; i += batchSize) {
      const batch = tickets.slice(i, i + batchSize);
      
      // Process each ticket in the batch
      await Promise.all(batch.map(async (ticket) => {
        try {
          // Create a temporary div for the ID card
          const div = document.createElement('div');
          div.id = 'idcard-print-area';
          div.style.width = '340px';
          div.style.height = '540px';
          div.style.padding = '20px';
          div.style.backgroundColor = 'white';
          div.style.position = 'absolute';
          div.style.left = '-9999px';
          div.style.top = '-9999px';
          
          // Add ID card content
          div.innerHTML = `
            <div style="width: 100%; height: 100%; border: 2px solid #1a365d; border-radius: 10px; overflow: hidden; position: relative;">
              <!-- Header -->
              <div style="background: #1a365d; color: white; padding: 15px; text-align: center;">
                <h2 style="margin: 0; font-size: 24px;">Senior Youth Congress 2025</h2>
                <p style="margin: 5px 0 0; font-size: 14px;">Official ID Card</p>
              </div>
              
              <!-- Photo Area -->
              <div style="padding: 20px; text-align: center;">
                <div style="width: 150px; height: 150px; margin: 0 auto; border: 2px solid #1a365d; border-radius: 5px; overflow: hidden;">
                  <img src="${ticket.passportPhoto}" alt="Passport Photo" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
              </div>
              
              <!-- Details -->
              <div style="padding: 0 20px;">
                <div style="margin-bottom: 15px;">
                  <p style="margin: 0; color: #4a5568; font-size: 12px;">Full Name</p>
                  <p style="margin: 5px 0 0; font-size: 18px; font-weight: bold;">${ticket.firstName} ${ticket.surname}</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <p style="margin: 0; color: #4a5568; font-size: 12px;">Ticket ID</p>
                  <p style="margin: 5px 0 0; font-size: 16px;">${ticket.id}</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <p style="margin: 0; color: #4a5568; font-size: 12px;">Conference</p>
                  <p style="margin: 5px 0 0; font-size: 16px;">${ticket.conference}</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <p style="margin: 0; color: #4a5568; font-size: 12px;">Contact</p>
                  <p style="margin: 5px 0 0; font-size: 16px;">${ticket.contactNumber}</p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="position: absolute; bottom: 0; left: 0; right: 0; background: #1a365d; color: white; padding: 10px; text-align: center; font-size: 12px;">
                <p style="margin: 0;">This ID card is valid for Senior Youth Congress 2025</p>
              </div>
            </div>
          `;
          
          document.body.appendChild(div);
          
          // Generate canvas from the div
          const canvas = await html2canvas(div, {
            scale: 2,
            backgroundColor: null,
            logging: false,
            useCORS: true
          });
          
          // Convert canvas to blob
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          
          // Add to zip
          zip.file(`id-card-${ticket.id}.png`, blob);
          
          // Clean up
          document.body.removeChild(div);
          
          processed++;
          self.postMessage({
            type: 'progress',
            progress: Math.round((processed / tickets.length) * 100)
          });
          
        } catch (error) {
          self.postMessage({
            type: 'warning',
            message: `Failed to generate ID card for ${ticket.id}: ${error.message}`
          });
        }
      }));
    }
    
    // Generate zip file
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Send completion message with zip file
    self.postMessage({
      type: 'complete',
      blob: content
    });
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: error.message
    });
  }
}; 