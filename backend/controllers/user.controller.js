// Import User model
import User from '../models/user.model.js';

export const trackPlantVisit = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ status: false, message: 'Unauthorized access' });
    }

    const userId = req.user._id;
    const { cubeName } = req.body;

    if (!cubeName) {
      return res
        .status(400)
        .json({ status: false, message: 'Plant name is required' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    // Check if the plant is already in visitedPlants
    const existingVisit = user.visitedPlants.find(
      (p) => p.plant_id === cubeName
    );

    if (existingVisit) {
      existingVisit.visitCount += 1;
    } else {
      user.visitedPlants.push({ plant_id: cubeName, visitCount: 1 });
    }

    await user.save();

    return res.status(200).json({
      status: true,
      message: 'Plant visit tracked successfully',
      visitedPlants: user.visitedPlants,
    });
  } catch (error) {
    console.error('Error tracking plant visit:', error.message);
    if (!res.headersSent) {
      return res.status(500).json({ status: false, message: 'Server error' });
    }
  }
};


export const handleHighScore = async (req, res) => {
try {
    const userId = req.user._id || req.user.id; // Use whichever your JWT middleware sets

    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    if (req.method === 'GET') {
      return res.status(200).json({ status: true, highScore: user.highScore || "0" });
    }

    const { newScore } = req.body;

    // Optional: only update if newScore is higher
    const currentScore = Number(user.highScore || 0);
    if (newScore > currentScore) {
      user.highScore = String(newScore);
      await user.save();
      return res.status(200).json({ status: true, message: 'High score updated', highScore: user.highScore });
    } else {
      return res.status(200).json({ status: true, message: 'Score not higher than existing', highScore: user.highScore });
    }

  } catch (err) {
    console.error('High score error:', err);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
};