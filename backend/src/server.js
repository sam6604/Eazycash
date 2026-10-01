import "dotenv/config";
import app from "./app.js";
import job from "./config/cron.js";

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV === "production") job.start();

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server is up and running on PORT:", PORT);
});
