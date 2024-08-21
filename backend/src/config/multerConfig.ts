const multer = require("multer");
import path from "path";

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, path.join(__dirname, "../../bucket/user"));
  },
  filename: (req: any, file: any, cb: any) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage: storage });

const formDataMulter = multer();

export default formDataMulter.none();
export const parsing = formDataMulter.none();
