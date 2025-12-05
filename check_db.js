const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://projman:Projman%40123@cluster0.kzciazl.mongodb.net/project_management";

const CategorySchema = new mongoose.Schema({
    id: Number,
    name: String,
    description: String,
});
const Category = mongoose.model("Category", CategorySchema);

mongoose.connect(MONGO_URI).then(async () => {
    const cats = await Category.find();
    console.log("--- CATEGORIES ---");
    cats.forEach(c => console.log(c.name));
    console.log("------------------");
    process.exit(0);
});
