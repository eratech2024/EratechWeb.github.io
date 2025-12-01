/**
 * Node.js Server for ERATECH Admin Panel
 * Handles saving data to JSON files and image uploads
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// Directories
const DATA_DIR = path.join(__dirname, 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const IMAGES_DIR = path.join(__dirname, 'images');
const UPLOADS_DIR = path.join(IMAGES_DIR, 'uploads');

// Ensure directories exist
async function ensureDirectories() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.mkdir(BACKUP_DIR, { recursive: true });
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
    } catch (error) {
        console.error('Error creating directories:', error);
    }
}

// Map data types to file names
const FILE_MAP = {
    'hero-banner': 'hero-banner-data.json',
    'hero-media': 'hero-media-data.json',
    'services': 'services-data.json',
    'projects': 'projects-data.json',
    'news': 'news-data.json',
    'investment': 'investment-data.json',
    'recruitment': 'recruitment-data.json',
    'about-video': 'about-video-data.json'
};

// Create backup of existing file
async function createBackup(filePath) {
    try {
        const fileName = path.basename(filePath, '.json');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const backupFile = path.join(BACKUP_DIR, `${fileName}_${timestamp}.json`);
        
        try {
            await fs.access(filePath);
            await fs.copyFile(filePath, backupFile);
        } catch (err) {
            return;
        }
        
        const backups = await fs.readdir(BACKUP_DIR);
        const fileBackups = backups
            .filter(f => f.startsWith(fileName))
            .map(f => ({
                name: f,
                path: path.join(BACKUP_DIR, f),
                time: fs.stat(path.join(BACKUP_DIR, f)).then(s => s.mtime)
            }));
        
        const sortedBackups = await Promise.all(
            fileBackups.map(async b => ({
                ...b,
                time: await b.time
            }))
        );
        
        sortedBackups.sort((a, b) => a.time - b.time);
        
        if (sortedBackups.length > 10) {
            for (let i = 0; i < sortedBackups.length - 10; i++) {
                await fs.unlink(sortedBackups[i].path);
            }
        }
    } catch (error) {
        console.error('Backup error:', error.message);
    }
}

// API: Save data
app.post('/api/save-data', async (req, res) => {
    try {
        const { type, data } = req.body;
        
        // Validate input
        if (!type || !data) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: type, data'
            });
        }
        
        // Check if type is valid
        if (!FILE_MAP[type]) {
            return res.status(400).json({
                success: false,
                message: `Invalid data type: ${type}`
            });
        }
        
        const fileName = FILE_MAP[type];
        const filePath = path.join(DATA_DIR, fileName);
        
        // Create backup
        await createBackup(filePath);
        
        const jsonContent = JSON.stringify(data, null, 2);
        await fs.writeFile(filePath, jsonContent, 'utf8');
        
        res.json({
            success: true,
            message: 'Data saved successfully',
            file: fileName,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to save data: ' + error.message
        });
    }
});

// API: Get data
app.get('/api/get-data/:type', async (req, res) => {
    try {
        const { type } = req.params;
        
        if (!FILE_MAP[type]) {
            return res.status(400).json({
                success: false,
                message: `Invalid data type: ${type}`
            });
        }
        
        const fileName = FILE_MAP[type];
        const filePath = path.join(DATA_DIR, fileName);
        
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(content);
            
            res.json({
                success: true,
                data: data
            });
        } catch (err) {
            // File doesn't exist, return empty data
            res.json({
                success: true,
                data: null,
                message: 'No data found'
            });
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get data: ' + error.message
        });
    }
});

// API: List backups
app.get('/api/backups/:type', async (req, res) => {
    try {
        const { type } = req.params;
        
        if (!FILE_MAP[type]) {
            return res.status(400).json({
                success: false,
                message: `Invalid data type: ${type}`
            });
        }
        
        const fileName = path.basename(FILE_MAP[type], '.json');
        const backups = await fs.readdir(BACKUP_DIR);
        const fileBackups = backups.filter(f => f.startsWith(fileName));
        
        const backupList = await Promise.all(
            fileBackups.map(async f => {
                const filePath = path.join(BACKUP_DIR, f);
                const stats = await fs.stat(filePath);
                return {
                    name: f,
                    size: stats.size,
                    created: stats.mtime
                };
            })
        );
        
        backupList.sort((a, b) => b.created - a.created);
        
        res.json({
            success: true,
            backups: backupList
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to list backups: ' + error.message
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// API: Upload image (base64)
app.post('/api/upload-image', async (req, res) => {
    try {
        const { image, folder, filename } = req.body;
        
        if (!image) {
            return res.status(400).json({
                success: false,
                message: 'Missing image data'
            });
        }
        
        // Extract base64 data
        const matches = image.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
        if (!matches) {
            return res.status(400).json({
                success: false,
                message: 'Invalid image format. Expected base64 data URL.'
            });
        }
        
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const finalFilename = filename || `img_${timestamp}_${randomStr}.${ext}`;
        
        // Determine target folder
        const targetFolder = folder ? path.join(UPLOADS_DIR, folder) : UPLOADS_DIR;
        await fs.mkdir(targetFolder, { recursive: true });
        
        // Save file
        const filePath = path.join(targetFolder, finalFilename);
        await fs.writeFile(filePath, buffer);
        
        // Return relative path for frontend use
        const relativePath = folder 
            ? `images/uploads/${folder}/${finalFilename}`
            : `images/uploads/${finalFilename}`;
        
        console.log(`Image uploaded: ${relativePath}`);
        
        res.json({
            success: true,
            message: 'Image uploaded successfully',
            path: relativePath,
            filename: finalFilename,
            size: buffer.length
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image: ' + error.message
        });
    }
});

// API: Upload multiple images
app.post('/api/upload-images', async (req, res) => {
    try {
        const { images, folder } = req.body;
        
        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing images data'
            });
        }
        
        const results = [];
        const targetFolder = folder ? path.join(UPLOADS_DIR, folder) : UPLOADS_DIR;
        await fs.mkdir(targetFolder, { recursive: true });
        
        for (const imageData of images) {
            try {
                const matches = imageData.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
                if (!matches) continue;
                
                const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                const base64Data = matches[2];
                const buffer = Buffer.from(base64Data, 'base64');
                
                const timestamp = Date.now();
                const randomStr = Math.random().toString(36).substring(2, 8);
                const filename = `img_${timestamp}_${randomStr}.${ext}`;
                
                const filePath = path.join(targetFolder, filename);
                await fs.writeFile(filePath, buffer);
                
                const relativePath = folder 
                    ? `images/uploads/${folder}/${filename}`
                    : `images/uploads/${filename}`;
                
                results.push({
                    success: true,
                    path: relativePath,
                    filename: filename,
                    size: buffer.length
                });
            } catch (err) {
                results.push({
                    success: false,
                    error: err.message
                });
            }
        }
        
        res.json({
            success: true,
            message: `Uploaded ${results.filter(r => r.success).length}/${images.length} images`,
            results: results
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload images: ' + error.message
        });
    }
});

// API: Delete image
app.delete('/api/delete-image', async (req, res) => {
    try {
        const { path: imagePath } = req.body;
        
        if (!imagePath) {
            return res.status(400).json({
                success: false,
                message: 'Missing image path'
            });
        }
        
        // Security check - only allow deleting from images/uploads
        if (!imagePath.startsWith('images/uploads/')) {
            return res.status(403).json({
                success: false,
                message: 'Can only delete images from uploads folder'
            });
        }
        
        const fullPath = path.join(__dirname, imagePath);
        
        // Check if file exists
        try {
            await fs.access(fullPath);
        } catch {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }
        
        await fs.unlink(fullPath);
        
        console.log(`Image deleted: ${imagePath}`);
        
        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete image: ' + error.message
        });
    }
});

// API: List uploaded images
app.get('/api/list-images/:folder?', async (req, res) => {
    try {
        const { folder } = req.params;
        const targetFolder = folder ? path.join(UPLOADS_DIR, folder) : UPLOADS_DIR;
        
        try {
            await fs.access(targetFolder);
        } catch {
            return res.json({
                success: true,
                images: [],
                message: 'Folder is empty or does not exist'
            });
        }
        
        const files = await fs.readdir(targetFolder);
        const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f));
        
        const images = await Promise.all(
            imageFiles.map(async f => {
                const filePath = path.join(targetFolder, f);
                const stats = await fs.stat(filePath);
                const relativePath = folder 
                    ? `images/uploads/${folder}/${f}`
                    : `images/uploads/${f}`;
                return {
                    filename: f,
                    path: relativePath,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                };
            })
        );
        
        images.sort((a, b) => b.created - a.created);
        
        res.json({
            success: true,
            images: images,
            count: images.length
        });
        
    } catch (error) {
        console.error('List images error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list images: ' + error.message
        });
    }
});

// Start server
async function startServer() {
    await ensureDirectories();
    
    app.listen(PORT, () => {
        console.log('\n🚀 ERATECH Server Started!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📡 Server running at: http://localhost:${PORT}`);
        console.log(`🔧 Admin Panel: http://localhost:${PORT}/admin/admin.html`);
        console.log(`🧪 Test API: http://localhost:${PORT}/api/test-api.html`);
        console.log(`💾 Data folder: ${DATA_DIR}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('Press Ctrl+C to stop server\n');
    });
}

// Handle errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

// Start
startServer();
