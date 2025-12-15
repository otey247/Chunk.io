import mammoth from "mammoth";
import Papa from "papaparse";

// Type definitions for external libraries loaded via CDN/ESM
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export const parseFile = async (file: File): Promise<string> => {
  const type = file.type;
  const name = file.name.toLowerCase();

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return await parsePDF(file);
  } else if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
    name.endsWith('.docx')
  ) {
    return await parseDocx(file);
  } else if (type === 'text/csv' || name.endsWith('.csv') || name.endsWith('.xlsx')) {
    return await parseCSV(file);
  } else if (type.startsWith('text/') || name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.json')) {
    return await file.text();
  } else {
    throw new Error(`Unsupported file type: ${type}`);
  }
};

const parsePDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += `--- Page ${i} ---\n${pageText}\n\n`;
  }
  return fullText;
};

const parseDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

const parseCSV = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results: any) => {
        // Convert CSV data back to a string representation or a structured text format
        // For chunking, we'll convert rows to "Key: Value" lines or markdown table
        const rows = results.data;
        if (!rows || rows.length === 0) return resolve("");
        
        // Simple CSV to text conversion
        const text = rows.map((row: any[]) => row.join(", ")).join("\n");
        resolve(text);
      },
      error: (err: any) => reject(err)
    });
  });
};

export const transcribeAudio = (): { 
  start: (onResult: (text: string, isFinal: boolean) => void) => void, 
  stop: () => void, 
  isSupported: boolean 
} => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    return { start: () => {}, stop: () => {}, isSupported: false };
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  return {
    start: (onResult: (text: string, isFinal: boolean) => void) => {
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        onResult(finalTranscript || interimTranscript, !!finalTranscript);
      };
      recognition.start();
    },
    stop: () => recognition.stop(),
    isSupported: true
  };
};