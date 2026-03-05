import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import logosImg from '../../assets/logos.png';
import QRCode from 'qrcode';

const IDCard = ({
  name = 'Attendee Name',
  id = 'ID123456',
  conference = 'Conference Name',
  phone = '0123456789',
  photoUrl = '',
  logos = []
}) => {
  const canvasRef = useRef(null);
  const logoImageRef = useRef(null);
  const photoImageRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const drawBadge = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const mainGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      mainGradient.addColorStop(0, '#141842');
      mainGradient.addColorStop(0.3, '#0c0f2e');
      mainGradient.addColorStop(0.7, '#1e1a5e');
      mainGradient.addColorStop(1, '#080b22');
      
      ctx.fillStyle = mainGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add subtle noise texture to background
      addNoiseTexture(0, 0, canvas.width, 252, 0.03);
      
      drawEnhancedHalftone(0, 0, 168, 252, 'left');
      drawEnhancedHalftone(570, 0, 168, 252, 'right');
      
      // Draw white section with premium texture
      drawWhiteSection();
      
      // Draw enhanced main circle with photo
      drawEnhancedCircle();
      
      // Add premium typography
      drawPremiumText();
      
      // Enhanced QR code
      drawEnhancedQRCode();
      
      // Draw enhanced footer
      drawEnhancedFooter();
    };
    
    const addNoiseTexture = (x, y, width, height, intensity) => {
      const imageData = ctx.getImageData(x, y, width, height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * intensity * 255;
        data[i] += noise;     // Red
        data[i + 1] += noise; // Green
        data[i + 2] += noise; // Blue
      }
      
      ctx.putImageData(imageData, x, y);
    };
    
    const drawEnhancedHalftone = (startX, startY, width, height, side) => {
      for (let y = startY; y < startY + height; y += 8) {
        for (let x = startX; x < startX + width; x += 8) {
          const waveOffset = Math.sin((y - startY) / 25) * 40 + Math.cos((y - startY) / 15) * 15;
          const shouldDraw = side === 'left' ? 
            x - startX < 80 + waveOffset : 
            x - startX > 40 - waveOffset;
          
          if (!shouldDraw) continue;
          
          const distanceFromEdge = side === 'left' ? x - startX : (startX + width) - x;
          const sizeMultiplier = Math.max(0.2, 1 - (distanceFromEdge / 100));
          const dotSize = (2 + Math.random() * 2) * sizeMultiplier;
          const opacity = 0.3 + (Math.random() * 0.4) * sizeMultiplier;
          
          ctx.fillStyle = `rgba(0, 200, 255, ${opacity * 0.5})`;
          ctx.beginPath();
          ctx.arc(x + Math.random() * 4 - 2, y + Math.random() * 4 - 2, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    
    const drawWhiteSection = () => {
      // Base white section with curved design
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, 252);
      ctx.quadraticCurveTo(canvas.width / 2, 224, canvas.width, 252);
      ctx.lineTo(canvas.width, 489);
      ctx.quadraticCurveTo(canvas.width / 2, 461, 0, 489);
      ctx.closePath();
      ctx.fill();
      
      // Add subtle paper texture
      const paperGradient = ctx.createRadialGradient(canvas.width/2, 371, 0, canvas.width/2, 371, 280);
      paperGradient.addColorStop(0, 'rgba(248, 250, 252, 0.8)');
      paperGradient.addColorStop(0.5, 'rgba(241, 245, 249, 0.6)');
      paperGradient.addColorStop(1, 'rgba(226, 232, 240, 0.4)');
      
      ctx.fillStyle = paperGradient;
      ctx.beginPath();
      ctx.moveTo(0, 252);
      ctx.quadraticCurveTo(canvas.width / 2, 224, canvas.width, 252);
      ctx.lineTo(canvas.width, 489);
      ctx.quadraticCurveTo(canvas.width / 2, 461, 0, 489);
      ctx.closePath();
      ctx.fill();
      
      // Add subtle texture dots
      for (let y = 266; y < 475; y += 21) {
        for (let x = 28; x < canvas.width - 28; x += 21) {
          if (Math.random() > 0.8) {
            const distFromCenter = Math.sqrt(Math.pow(x - canvas.width/2, 2) + Math.pow(y - 252, 2));
            if (distFromCenter > 84) {
              ctx.fillStyle = 'rgba(0, 200, 255, 0.04)';
              ctx.beginPath();
              ctx.arc(x + Math.random() * 4 - 2, y + Math.random() * 4 - 2, 0.5 + Math.random(), 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
    };
    
    const drawEnhancedCircle = () => {
      const circleX = canvas.width / 2;
      const circleY = 168; // Scaled for new canvas size
      const circleRadius = 112; // Scaled proportionally
      
      const glowGradient = ctx.createRadialGradient(circleX, circleY, circleRadius, circleX, circleY, circleRadius + 20);
      glowGradient.addColorStop(0, 'rgba(0, 200, 255, 0.3)');
      glowGradient.addColorStop(1, 'rgba(0, 200, 255, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(circleX, circleY, circleRadius + 20, 0, Math.PI * 2);
      ctx.fill();
      
      // White border with soft shadow
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
      ctx.beginPath();
      ctx.arc(circleX, circleY, circleRadius + 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      // Draw photo or placeholder circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
      ctx.clip();
      
      if (photoImageRef.current && photoImageRef.current.complete) {
        // Draw the photo with proper cropping and centering
        const img = photoImageRef.current;
        const targetSize = circleRadius * 2;
        
        // Calculate source dimensions for center cropping
        const imgWidth = img.naturalWidth || img.width;
        const imgHeight = img.naturalHeight || img.height;
        const imgAspectRatio = imgWidth / imgHeight;
        const targetAspectRatio = 1; // Circle is 1:1
        
        let sourceX, sourceY, sourceWidth, sourceHeight;
        
        if (imgAspectRatio > targetAspectRatio) {
          // Image is wider - crop horizontally
          sourceHeight = imgHeight;
          sourceWidth = imgHeight; // Make it square
          sourceX = (imgWidth - sourceWidth) / 2; // Center horizontally
          sourceY = 0;
        } else {
          // Image is taller - crop vertically  
          sourceWidth = imgWidth;
          sourceHeight = imgWidth; // Make it square
          sourceX = 0;
          sourceY = (imgHeight - sourceHeight) / 2; // Center vertically
        }
        
        // Draw the cropped and centered image
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle (crop area)
          circleX - circleRadius, circleY - circleRadius, targetSize, targetSize // Destination rectangle
        );
      } else if (photoUrl && !photoImageRef.current) {
        // Photo URL provided but still loading — show loading state
        const circleGradient = ctx.createRadialGradient(circleX - 20, circleY - 20, 0, circleX, circleY, circleRadius);
        circleGradient.addColorStop(0, 'rgba(0,200,255,0.4)');
        circleGradient.addColorStop(0.6, 'rgba(0,102,238,0.5)');
        circleGradient.addColorStop(1, '#1e1a5e');
        
        ctx.fillStyle = circleGradient;
        ctx.beginPath();
        ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 14px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText('Loading…', circleX, circleY - 4);
        ctx.font = '12px "Segoe UI"';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText('photo', circleX, circleY + 12);
      } else {
        // No photo URL or load failed — show placeholder
        const circleGradient = ctx.createRadialGradient(circleX - 20, circleY - 20, 0, circleX, circleY, circleRadius);
        circleGradient.addColorStop(0, '#4db8ff');
        circleGradient.addColorStop(0.6, '#0066ee');
        circleGradient.addColorStop(1, '#1e1a5e');
        
        ctx.fillStyle = circleGradient;
        ctx.beginPath();
        ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 16px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText('No Photo', circleX, circleY + 5);
      }
      
      ctx.restore();
      
      // Inner highlight overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(circleX - 15, circleY - 15, 25, 0, Math.PI * 2);
      ctx.fill();
    };
    
    const drawPremiumText = () => {
      // Reset text settings
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Draw logos - 2x2 grid on the left (4 logos: two per row, two rows)
      if (logoImageRef.current && logoImageRef.current.complete) {
        const img = logoImageRef.current;
        const singleW = 72;
        const singleH = img.height * (singleW / (img.width / 4));
        const gap = 6;
        const startX = 28;
        const startY = 36;
        const qw = img.width / 4;
        ctx.drawImage(img, 0, 0, qw, img.height, startX, startY, singleW, singleH);
        ctx.drawImage(img, qw, 0, qw, img.height, startX + singleW + gap, startY, singleW, singleH);
        ctx.drawImage(img, qw * 2, 0, qw, img.height, startX, startY + singleH + gap, singleW, singleH);
        ctx.drawImage(img, qw * 3, 0, qw, img.height, startX + singleW + gap, startY + singleH + gap, singleW, singleH);
      }
      
      // Main title - right side, next to profile pic (not above it)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Segoe UI"';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 2;
      
      const textX = canvas.width - 28;
      const lineSpacing = 34;
      const blockTop = 52;
      ctx.fillText('CC-NCSA', textX, blockTop);
      ctx.font = 'bold 26px "Segoe UI"';
      ctx.fillText('SENIOR YOUTH', textX, blockTop + lineSpacing);
      ctx.fillText('CONGRESS', textX, blockTop + lineSpacing * 2);
      ctx.fillText('2026', textX, blockTop + lineSpacing * 3);
      
      // Reset shadow and text alignment
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.textAlign = 'center'; // Reset to center for other text elements
      
      // Dynamic name rendering with auto-sizing and line breaking (centered with more margin from photo)
      drawDynamicName(name.toUpperCase(), canvas.width / 2, 364);
      
      // Conference label - show full conference names (centered with py-2 spacing)
      ctx.fillStyle = '#4a5568';
      ctx.font = '15px "Segoe UI"';
      
      // Use full conference names without shortening
      let conferenceFull = conference.toUpperCase();
      
      // Handle special cases for consistent formatting
      if (conference === 'Other') {
        conferenceFull = 'OTHER CONFERENCE';
      }
      
      ctx.fillText(conferenceFull, canvas.width / 2, 396); // Scaled position
      
      // ID text (centered with py-2 spacing) - uniform size with conference
      ctx.fillStyle = '#2d3748';
      ctx.font = '25px "Segoe UI"';
      ctx.letterSpacing = '1px';
      ctx.fillText(`ID: ${id}`, canvas.width / 2, 429); // Scaled position
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    };

    const drawDynamicName = (nameText, x, y) => {
      ctx.fillStyle = '#2d3748';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 1;
      
      const maxWidth = canvas.width - 196; // Scaled for new canvas size
      const maxSingleLineWidth = maxWidth * 0.8; // More conservative for single line
      let fontSize = 36; // Scaled starting font size
      let lineHeight = fontSize * 1.2;
      
      // Function to measure text width with current font
      const measureText = (text, font) => {
        ctx.font = font;
        return ctx.measureText(text).width;
      };
      
      // Try to fit name on single line by reducing font size more aggressively
      ctx.font = `bold ${fontSize}px "Segoe UI"`;
      let textWidth = measureText(nameText, ctx.font);
      
      // More aggressive font size reduction
      while (textWidth > maxSingleLineWidth && fontSize > 16) {
        fontSize -= 2;
        ctx.font = `bold ${fontSize}px "Segoe UI"`;
        textWidth = measureText(nameText, ctx.font);
        lineHeight = fontSize * 1.2;
      }
      
      // If still too long, split first name and surname
      if (textWidth > maxSingleLineWidth) {
        const words = nameText.split(' ');
        let firstName = '';
        let surname = '';
        
        // Smart splitting - try to balance first name vs surname
        if (words.length >= 2) {
          // If multiple words, put first word(s) as first name, last as surname
          const midPoint = Math.ceil(words.length / 2);
          firstName = words.slice(0, midPoint).join(' ');
          surname = words.slice(midPoint).join(' ');
        } else {
          // Single long word - keep as is but reduce font more
          firstName = nameText;
          surname = '';
        }
        
        // Reset font size for two-line layout
        fontSize = 22; // Slightly smaller for two lines
        lineHeight = fontSize * 1.1; // Tighter line height
        
        if (surname) {
          // Two lines - first name and surname
          ctx.font = `bold ${fontSize}px "Segoe UI"`;
          
          // Check if individual lines fit, reduce font if needed
          let firstNameWidth = measureText(firstName, ctx.font);
          let surnameWidth = measureText(surname, ctx.font);
          
          while ((firstNameWidth > maxWidth || surnameWidth > maxWidth) && fontSize > 14) {
            fontSize -= 1;
            ctx.font = `bold ${fontSize}px "Segoe UI"`;
            firstNameWidth = measureText(firstName, ctx.font);
            surnameWidth = measureText(surname, ctx.font);
            lineHeight = fontSize * 1.1;
          }
          
          // Draw first name and surname on separate lines
          const lineSpacing = lineHeight;
          ctx.fillText(firstName, x, y - lineSpacing/2);
          ctx.fillText(surname, x, y + lineSpacing/2);
          
        } else {
          // Single long word - reduce font more aggressively
          while (textWidth > maxWidth && fontSize > 12) {
            fontSize -= 1;
            ctx.font = `bold ${fontSize}px "Segoe UI"`;
            textWidth = measureText(firstName, ctx.font);
          }
          ctx.fillText(firstName, x, y);
        }
        
      } else {
        // Single line fits - draw normally
        ctx.font = `bold ${fontSize}px "Segoe UI"`;
        ctx.fillText(nameText, x, y);
      }
    };
    
    const drawEnhancedQRCode = async () => {
      const startX = canvas.width - 137; // Scaled for new canvas size
      const startY = 350; // Scaled position
      const qrSize = 112; // Scaled QR code size
      
      try {
        // Generate real QR code data URL
        const qrDataURL = await QRCode.toDataURL(id, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          quality: 0.92,
          margin: 1,
          color: {
            dark: '#0c0f2e',
            light: '#ffffff'
          },
          width: qrSize
        });
        
                 // Create image from QR code data URL
         const qrImage = new Image();
         qrImage.onload = () => {
           // White background with nice border
           const padding = 8;
           const borderWidth = 2;
           
           // Draw border
           ctx.fillStyle = '#e5e7eb'; // Light gray border
           ctx.fillRect(startX - padding - borderWidth, startY - padding - borderWidth, 
                       qrSize + (padding + borderWidth) * 2, qrSize + (padding + borderWidth) * 2);
           
           // Draw white background
           ctx.fillStyle = '#ffffff';
           ctx.fillRect(startX - padding, startY - padding, qrSize + padding * 2, qrSize + padding * 2);
           
           // Draw the real QR code
           ctx.drawImage(qrImage, startX, startY, qrSize, qrSize);
         };
        qrImage.src = qrDataURL;
        
             } catch (error) {
         console.error('Error generating QR code:', error);
         // Fallback: draw with same white bg and border styling
         const padding = 8;
         const borderWidth = 2;
         
         // Draw border
         ctx.fillStyle = '#e5e7eb';
         ctx.fillRect(startX - padding - borderWidth, startY - padding - borderWidth, 
                     qrSize + (padding + borderWidth) * 2, qrSize + (padding + borderWidth) * 2);
         
         // Draw white background
         ctx.fillStyle = '#ffffff';
         ctx.fillRect(startX - padding, startY - padding, qrSize + padding * 2, qrSize + padding * 2);
         
         // Draw error placeholder
         ctx.fillStyle = '#0c0f2e';
         ctx.fillRect(startX, startY, qrSize, qrSize);
         
         ctx.fillStyle = '#ffffff';
         ctx.font = 'bold 12px "Segoe UI"';
         ctx.textAlign = 'center';
         ctx.fillText('QR Error', startX + qrSize/2, startY + qrSize / 2);
       }
    };
    
    const drawEnhancedFooter = () => {
      const footerGradient = ctx.createLinearGradient(0, 489, 0, canvas.height);
      footerGradient.addColorStop(0, '#141842');
      footerGradient.addColorStop(1, '#0c0f2e');
      
      ctx.fillStyle = footerGradient;
      ctx.beginPath();
      ctx.moveTo(0, 489);
      ctx.quadraticCurveTo(canvas.width / 2, 461, canvas.width, 489);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();
      
      // Add subtle highlight on curve
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 489);
      ctx.quadraticCurveTo(canvas.width / 2, 461, canvas.width, 489);
      ctx.stroke();
      
      // Add tagline text - Connected (Connect in cyan, ed in white)
      ctx.font = 'bold 34px "Segoe UI"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Enhanced text shadow for better visibility and boldness
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 2;
      
      const footerY = 489 + (canvas.height - 489) / 2 - 6; // Scaled footer position
      
      const connectText = 'Connect';
      const edText = 'ed';
      
      const connectWidth = ctx.measureText(connectText).width;
      const edWidth = ctx.measureText(edText).width;
      
      const totalWidth = connectWidth + edWidth;
      const startX = (canvas.width - totalWidth) / 2;
      
      ctx.fillStyle = '#00c8ff';
      ctx.fillText(connectText, startX + connectWidth/2, footerY);
      
      ctx.fillStyle = '#ffffff';
      ctx.fillText(edText, startX + connectWidth + edWidth/2, footerY);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    };

    // Load images and draw — only show card when BOTH photo AND logos are loaded; otherwise keep loading
    const finishAndSetReady = async () => {
      drawBadge();
      await drawEnhancedQRCode();
      setIsReady(true);
    };

    const loadImagesAndDraw = async () => {
      let logoLoaded = false;
      let logoLoadSuccess = false;
      let photoResolved = false;
      let photoLoadSuccess = false;

      const tryFinish = async () => {
        if (!logoLoaded || !photoResolved) return;
        // Only show card when we have both photo and logos — otherwise keep loading
        if (!logoLoadSuccess || !photoLoadSuccess) return;
        await finishAndSetReady();
      };

      const tryDraw = async () => {
        if (!logoLoaded) return;
        if (photoUrl && !photoResolved) {
          drawBadge();
          await drawEnhancedQRCode();
        } else {
          await tryFinish();
        }
      };

      // Load logo
      if (logosImg) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.onload = () => {
          logoImageRef.current = logoImg;
          logoLoaded = true;
          logoLoadSuccess = true;
          tryDraw();
        };
        logoImg.onerror = () => {
          logoLoaded = true;
          logoLoadSuccess = false;
          tryDraw();
        };
        logoImg.src = logosImg;
      } else {
        logoLoaded = true;
        logoLoadSuccess = false;
        tryDraw();
      }

      // Load photo
      if (photoUrl) {
        const photoImg = new Image();
        photoImg.crossOrigin = 'anonymous';
        photoImg.onload = () => {
          photoImageRef.current = photoImg;
          photoResolved = true;
          photoLoadSuccess = true;
          tryFinish();
        };
        photoImg.onerror = () => {
          photoResolved = true;
          photoLoadSuccess = false;
          tryFinish();
        };
        photoImg.src = photoUrl;
      } else {
        photoResolved = true;
        photoLoadSuccess = false;
        tryDraw();
      }
    };

    loadImagesAndDraw();
    
  }, [name, id, conference, photoUrl]);

  const canvasStyle = {
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)',
    transition: 'opacity 0.4s ease, transform 0.3s ease',
    cursor: 'pointer',
    opacity: isReady ? 1 : 0,
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      position: 'relative',
      width: 738,
      height: 559,
    }}>
      {/* Skeleton loader */}
      {!isReady && (
        <div
          style={{
            width: 738,
            height: 559,
            borderRadius: 12,
            background: 'linear-gradient(110deg, #111540 0%, #111540 40%, rgba(0,200,255,0.08) 50%, #111540 60%, #111540 100%)',
            backgroundSize: '300% 100%',
            animation: 'idcard-skeleton-shimmer 1.8s ease-in-out infinite',
            position: 'absolute',
            border: '1px solid rgba(0,200,255,0.1)',
          }}
        >
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(0,200,255,0.1)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 200,
            height: 16,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.08)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: 50,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 12,
            borderRadius: 6,
            background: 'rgba(255,255,255,0.06)',
          }} />
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={738}
        height={559}
        style={canvasStyle}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-5px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0px)';
        }}
      />
    </div>
  );
};

IDCard.propTypes = {
  name: PropTypes.string,
  id: PropTypes.string,
  conference: PropTypes.string,
  phone: PropTypes.string,
  photoUrl: PropTypes.string,
  logos: PropTypes.array
};

export default IDCard; 