const Reviews = require("../Model/ReviewsModel");

// Get all reviews
const getAllReviews = async (req, res, next) => {

    let reviews;

    try {
        reviews = await Reviews.find();
        
    } catch (err) {
        console.log(err);
    }
    
    if(!reviews) {
        return res.status(404).json({message:"Details not found"});
    }

    return res.status(200).json({ reviews });

};

// Add new review
const addReview = async (req, res, next) => {
    const { ownerName, petName, grooming, walking, species, rating, sentiment, comment } = req.body;

    try {
        const review = new Reviews({
            ownerName,
            petName,
            grooming,
            walking,
            species,
            rating,
            sentiment,
            comment
        });
        await review.save();
        return res.status(201).json({ review });
    } catch (err) {
        console.log(err);
    }

    if(!reviews){
        return res.status(404).json({ message: "Unable to add review" });
    }
    return res.status(200).json({ careCustomers });
    
};

// Get review by ID
const getReviewById = async (req, res, next) => {
    const id = req.params.id;

    let review;
    try {
        review = await Reviews.findById(id);
        
        } catch (err) {
            console.log(err);
        }

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        return res.status(200).json({ review });
};

// Update review
const updateReview = async (req, res, next) => {
    const id = req.params.id;
    const { ownerName, petName, grooming, walking, species, rating, sentiment, comment } = req.body;

    let review;

    try {
        review = await Reviews.findByIdAndUpdate(
            id,
            { ownerName: ownerName, petName: petName, 
                grooming: grooming, walking: walking,
                species: species, rating: rating,
                sentiment: sentiment, comment: comment

            }, { new: true });
            review = await review.save();
        
    } catch (err) {
        console.log(err);
    }

    if (!review) {
            return res.status(404).json({ message: "Unable to update review" });
        }
        return res.status(200).json({ review });

};

// Delete review
const deleteReview = async (req, res, next) => {
    const id = req.params.id;
    let review;
    try {
        review = await Reviews.findByIdAndDelete(id);
        
    } catch (err) {
        console.log(err);
    }
    if (!review) {
            return res.status(404).json({ message: "Unable to delete review" });
        }
        return res.status(200).json({ review });
};

exports.getAllReviews = getAllReviews;
exports.addReview = addReview;
exports.getReviewById = getReviewById;
exports.updateReview = updateReview;
exports.deleteReview = deleteReview;
