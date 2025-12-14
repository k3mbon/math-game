
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convert() {
    console.log('Starting PDF conversion process...');
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        // Path to your HTML file
        const htmlPath = path.join(__dirname, 'Workflow_Proyek.html');
        const pdfPath = path.join(__dirname, 'Workflow_Proyek.pdf');

        if (!fs.existsSync(htmlPath)) {
            throw new Error(`Source HTML file not found: ${htmlPath}`);
        }

        console.log(`Opening file: ${htmlPath}`);
        
        // Load the HTML file
        // networkidle0 ensures we wait for external resources (fonts, images) to load
        await page.goto(`file:${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

        // Set viewport to simulate a desktop screen for consistent rendering before print
        await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });

        console.log('Generating PDF...');

        // Generate PDF with professional settings
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true, // Print background colors/images
            margin: {
                top: '0.5in',
                right: '0.5in',
                bottom: '0.5in',
                left: '0.5in'
            },
            displayHeaderFooter: false, // Keep it clean
            scale: 1, // Ensure content isn't artificially scaled down unless responsive
            preferCSSPageSize: true // Respect @page rules if any
        });

        // Validation
        if (fs.existsSync(pdfPath)) {
            const stats = fs.statSync(pdfPath);
            console.log(`✅ PDF created successfully at: ${pdfPath}`);
            console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
            
            if (stats.size < 1000) {
                console.warn('⚠️ Warning: PDF file size is suspiciously small. Check content.');
            }
        } else {
            throw new Error('PDF file was not created.');
        }

    } catch (error) {
        console.error('❌ Error during PDF conversion:', error);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

convert();
