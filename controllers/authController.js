
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/*/ Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id, 
            fullName: user.fullName, // Fixed from fullname to fullName
            DOB: user.DOB,
            std: user.std
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: "360d" }
    );
};*/
// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id, 
            fullName: user.fullName,
            DOB: user.DOB,
            std: user.std || user.teacherId, // Add this fallback
            teacherId: user.teacherId, // Add this explicitly for teachers
            userType: user.userType
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: "360d" }
    );
};


// Register new user
const register = async (req, res, next) => {
    try {
        console.log('Request body:', req.body); // Add this for debugging
        
        const { fullName, DOB, std } = req.body;

        // Enhanced validation
        if (!fullName || !DOB || !std) {
            return res.status(400).json({ 
                message: 'All fields are required',
                received: { fullName: !!fullName, DOB: !!DOB, std: !!std }
            });
        }

        // Validate DOB format (should be YYYY-MM-DD or similar)
        const dobRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/;
        if (!dobRegex.test(DOB)) {
            return res.status(400).json({ 
                message: 'Invalid date format. Use YYYY-MM-DD or MM/DD/YYYY',
                received: DOB
            });
        }

        // Create new user
        const user = new User({
            fullName: fullName.trim(),
            std: std.toString().trim(), // Ensure std is string
            DOB: DOB.trim(),
            userType: "student"
        });

        await user.save();
        console.log('User registered successfully:', user.fullName);

        // Generate JWT token
        const token = generateToken(user);
    
        // Send response with token and user details
        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                DOB: user.DOB,
                std: user.std
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle MongoDB validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation failed',
                errors: Object.keys(error.errors).map(key => ({
                    field: key,
                    message: error.errors[key].message
                }))
            });
        }
        
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
};
const login = async (req, res, next) => {
    try {
        const { fullName,std } = req.body;
        console.log('Login attempt:', fullName, std);

        // Validation
        if (!fullName || !std) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Find user by email and other credentials
        const user = await User.findOne({ fullName, std});
         // FIXED: was user1Id, branch (not used in this context)
        if (!user) {
            console.log('User not found:', fullName, std);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        

        // Generate JWT token
        const token = generateToken(user);

        
       let redirectUrl;
       redirectUrl = '/student-dashboard'; // Default for students


        console.log('Login successful for:', fullName, 'Redirecting to:', redirectUrl);

        
        // In the login function, update the user object in the response:

   res.json({
    message: 'Login successful',
    token,
    redirectUrl,
    user: {
        _id: user._id,
        fullName: user.fullName,
        std: user.std,
    }
 });

    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
};
/*const loginT = async (req, res, next) => {
    try {
        const { fullName,teacherId,password } = req.body;
        console.log('Login attempt:', fullName, teacherId ,password);

        // Validation
        if (!fullName || !teacherId||!password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Find user by email and other credentials
        const user = await User.findOne({ fullName, teacherId,password});
         // FIXED: was user1Id, branch (not used in this context)
        if (!user) {
            console.log('User not found:', fullName, teacherId,password);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        

        // Generate JWT token
        const token = generateToken(user);

        
       let redirectUrl;
       redirectUrl = '/admin-dashboard'; // Default for students


        console.log('Login successful for:', fullName, 'Redirecting to:', redirectUrl);

        
        // In the login function, update the user object in the response:

   res.json({
    message: 'Login successful',
    token,
    redirectUrl,
    user: {
        
        fullName: user.fullName,
        std: user.teacherId,
    }
 });

    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
};*/

const registerT = async (req, res, next) => {
    try {
        console.log('Teacher registration request body:', req.body);
        
        const { fullName, teacherId, password, confirmPassword } = req.body;

        // Enhanced validation
        if (!fullName || !teacherId || !password || !confirmPassword) {
            return res.status(400).json({ 
                message: 'All fields are required',
                received: { 
                    fullName: !!fullName, 
                    teacherId: !!teacherId, 
                    password: !!password, 
                    confirmPassword: !!confirmPassword 
                }
            });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ 
                message: 'Passwords do not match' 
            });
        }

        // Check if teacher with same teacherId already exists
        const existingTeacher = await User.findOne({ teacherId });
        if (existingTeacher) {
            return res.status(409).json({ 
                message: 'Teacher with this ID already exists' 
            });
        }

        // Create new teacher user
        const user = new User({
            fullName: fullName.trim(),
            teacherId: teacherId.toString().trim(),
            password: password.trim(),
            userType: "teacher"
        });

        await user.save();
        console.log('Teacher registered successfully:', user.fullName);

        // Generate JWT token
        const token = generateToken(user);
    
        // Send response with token and user details
        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                teacherId: user.teacherId,
                userType: user.userType
            }
        });

    } catch (error) {
        console.error('Teacher registration error:', error);
        
        // Handle MongoDB validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation failed',
                errors: Object.keys(error.errors).map(key => ({
                    field: key,
                    message: error.errors[key].message
                }))
            });
        }
        
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
};
const loginT = async (req, res, next) => {
    try {
        const { fullName, teacherId } = req.body;
        console.log('Teacher login attempt:', fullName, teacherId);

        // Validation
        if (!fullName || !teacherId) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Find teacher user
        const user = await User.findOne({ 
            fullName, 
            teacherId, 
            userType: "teacher" 
        });
        
        if (!user) {
            console.log('Teacher not found:', fullName, teacherId);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = generateToken(user);

        let redirectUrl = '/admin-dashboard';

        console.log('Teacher login successful for:', fullName, 'Redirecting to:', redirectUrl);

        res.json({
            message: 'Login successful',
            token,
            redirectUrl,
            user: {
                fullName: user.fullName,
        std: user.teacherId, // Keep this for compatibility
        teacherId: user.teacherId, // Add this explicitly
        userType: user.userType

            }
        });

    } catch (error) {
        console.error('Teacher login error:', error);
        next(error);
    }
};

const logout = (req, res) => {
    res.json({ message: 'Logout successful' });
};
const getProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const user = await User.findById(req.user.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // For teachers, you might want to return additional info
        if (user.userType === 'teacher') {
            res.json({
                ...user.toObject(),
                teacherId: user.teacherId // Explicitly include teacherId
            });
        } else {
            res.json(user);
        }
        
    } catch (error) {
        console.error('Profile error:', error);
        next(error);
    }
};
module.exports = {
    register,
    login,
    loginT,
    registerT,
    getProfile,
    logout
};

