const Lecture = require('../models/Lecture');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for video upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = 'uploads/videos';
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'lecture-' + uniqueSuffix + path.extname(file.originalname));
  }
});

/*const fileFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|mov|wmv|flv|webm|mkv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'));
  }
};*/
// Parse tags if they're sent as string


const fileFilter = (req, file, cb) => {
  // Check MIME type first (more reliable)
  const allowedMimeTypes = [
    'video/mp4',
    'video/avi', 
    'video/quicktime', // for .mov files
    'video/x-msvideo', // for .avi files
    'video/x-ms-wmv', // for .wmv files
    'video/x-flv', // for .flv files
    'video/webm',
    'video/x-matroska' // for .mkv files
  ];

  const allowedExtensions = /\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i;
  
  console.log('File mimetype:', file.mimetype); // Debug log
  console.log('File extension:', path.extname(file.originalname).toLowerCase()); // Debug log
  
  const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);
  const hasValidExtension = allowedExtensions.test(file.originalname.toLowerCase());

  if (hasValidMimeType || hasValidExtension) {
    return cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Received: ${file.mimetype}, Extension: ${path.extname(file.originalname)}`));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: fileFilter
});

class LectureController {
  // Upload video lecture
 /* static uploadLecture = async (req, res) => {
    try {
      const {
        title,
        description,
        subject,
        teacherName,
        teacherId,
        tags,
        category,
        isPublished
      } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Video file is required'
        });
      }*/
      static uploadLecture = async (req, res) => {
  try {
    console.log('Upload request body:', req.body);
    console.log('Upload file info:', req.file);

    const {
      title,
      description,
      subject,
      teacherName,
      teacherId,
      tags,
      category,
      isPublished
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Video file is required'
      });
    }

    // Validate required fields
    if (!title || !description || !subject || !teacherName || !teacherId) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled'
      });
    }

    

      // Parse tags if they're sent as string
      const parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;

      const lecture = new Lecture({
        title,
        description,
        subject,
        teacherName,
        teacherId,
        videoUrl: `/uploads/videos/${req.file.filename}`,
        videoFileName: req.file.filename,
        tags: parsedTags,
        category,
        isPublished: isPublished === 'true'
      });

      await lecture.save();

      res.status(201).json({
        success: true,
        message: 'Lecture uploaded successfully',
        data: lecture
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload lecture',
        error: error.message
      });
    }
  };

  // Get all lectures for a teacher
  /*static getTeacherLectures = async (req, res) => {
    try {
      const { teacherId } = req.params;
      const { page = 1, limit = 10, search = '' } = req.query;

      const query = { teacherId };
      
      if (search) {
        query.$text = { $search: search };
      }

      const lectures = await Lecture.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Lecture.countDocuments(query);

      res.json({
        success: true,
        data: lectures,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lectures',
        error: error.message
      });
    }
  };*/
  static getTeacherLectures = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { page = 1, limit = 10, search = '' } = req.query;

    let query = { teacherId };
    
    if (search) {
      // Use regex search instead of text search
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const lectures = await Lecture.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Lecture.countDocuments(query);

    res.json({
      success: true,
      data: lectures,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching lectures:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lectures',
      error: error.message
    });
  }
};

  // Update lecture
  /*static updateLecture = async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const lecture = await Lecture.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );

      if (!lecture) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found'
        });
      }

      res.json({
        success: true,
        message: 'Lecture updated successfully',
        data: lecture
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update lecture',
        error: error.message
      });
    }
  };*/
  // Update the updateLecture method to handle view count increments:
static updateLecture = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If updating view count, increment it
    if (updates.viewCount !== undefined) {
      await Lecture.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
      const lecture = await Lecture.findById(id);
      return res.json({
        success: true,
        message: 'View count updated',
        data: lecture
      });
    }

    const lecture = await Lecture.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

    res.json({
      success: true,
      message: 'Lecture updated successfully',
      data: lecture
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update lecture',
      error: error.message
    });
  }
};

  // Delete lecture
  static deleteLecture = async (req, res) => {
    try {
      const { id } = req.params;

      const lecture = await Lecture.findById(id);
      if (!lecture) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found'
        });
      }

      // Delete video file
      try {
        await fs.unlink(`uploads/videos/${lecture.videoFileName}`);
      } catch (fileError) {
        console.error('Error deleting video file:', fileError);
      }

      await Lecture.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Lecture deleted successfully'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete lecture',
        error: error.message
      });
    }
  };
  static getLectureById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lecture = await Lecture.findById(id);
    
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

    res.json({
      success: true,
      data: lecture
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lecture',
      error: error.message
    });
  }
};

static handleUpload = (req, res, next) => {
  upload.single('video')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 500MB'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
  
};
// Increment view count
static incrementViewCount = async (req, res) => {
    try {
        const { id } = req.params;
        
        const lecture = await Lecture.findByIdAndUpdate(
            id,
            { $inc: { viewCount: 1 } },
            { new: true }
        );

        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: 'Lecture not found'
            });
        }

        res.json({
            success: true,
            message: 'View count updated',
            data: lecture
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update view count',
            error: error.message
        });
    }
};
}




module.exports = { LectureController, upload };