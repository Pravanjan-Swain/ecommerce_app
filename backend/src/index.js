import { app } from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./db/index.js";

dotenv.config({path: "./.env"});

connectDB()
.then(() => {
    const PORT = process.env.PORT || 8000;

    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    })
})
.catch(err => {
    console.log(err.message);
    process.exit(1);
});

