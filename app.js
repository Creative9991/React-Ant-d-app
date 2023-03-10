require("dotenv").config();

const multer = require("multer");

const fs = require("fs");
const util = require("util");
const unlikeFile = util.promisify(fs.unlink);

const upload = multer({ dest: "downloads/" });

const { uploadFile, getFileStream } = require("./src/s3");
const cors = require("cors");

const jwt = require("jsonwebtoken");
const express = require("express");
const {
  getSpaceAgenciesData,
  getSpaceAgenciesDataById,
  getPostById,
  getAllPosts,
  addOrUpdateAgencies,
  deleteAgencies,
  createPost,
} = require("./dynamodb");
const app = express();

app.get("/", (req, res) => {
  res.send("Yes Server is running at 3100");
});

const port = process.env.PORT || 3100;

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

const listOfUsernames = [
  {
    username: "Mukesh",
    title: "Post 1",
  },
  {
    username: "Katipally",
    title: "Post 2",
  },
];

app.get("/usernames", authenticateToken, (req, res) => {
  res.json(listOfUsernames.filter((e) => e.username === req.user.name));
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const user = { name: username };

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  res.json({ accessToken: accessToken });
});

app.get("/images/:key", (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

app.post("/images", upload.single("image"), async (req, res) => {
  const file = req.file;
  const result = await uploadFile(file);
  await unlikeFile(file.path);
  const description = req.body.description;
  res.send({ imagePath: `/images/${result.Key}` });
});

function authenticateToken(req, res, next) {
  const authHeader = req.header["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.post("/agencies/:id", async (req, res) => {
  const agencies = req.body;
  try {
    const newAgencies = await addOrUpdateAgencies(agencies);
    res.json(newAgencies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: "something went wrong" });
  }
});

app.put("/agencies/:id", async (req, res) => {
  const agencies = req.body;
  const { id } = req.params;
  agencies.id = id;
  try {
    const updateAgencies = await updateAgencies(agencies);
    res.json(updateAgencies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: "something went wrong" });
  }
});

app.delete("/agencies/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteMyAgencies = await deleteAgencies(id);
    res.json(deleteMyAgencies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: "something went wrong" });
  }
});

app.get("/spacecrafts", async (req, res) => {
  try {
    const agencies = await getSpaceAgenciesData();

    res.json(agencies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: "something went wrong" });
  }
});

// app.get("/centers", async (req, res) => {
//   try {
//     const centers = await getSpaceAgenciesData();
//     console.log(centers);

//     centers.Items.map((center) => {
//       res.json(center);
//     });
//   } catch (error) {
//     console.log(error);
//   }
// });

app.post("/posts", async (req, res) => {
  const create = req.body;
  console.log(create);
  try {
    const newPost = await createPost(create);
    const pushPosts = newPost.Items[0].posts;
    res.json(pushPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: "something went wrong" });
  }
});

app.get("/posts", async (req, res) => {
  try {
    const allPosts = await getAllPosts();
    const specificPosts = allPosts.Items[0].posts;
    res.json(specificPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: "something went wrong" });
  }
});

app.get("/posts/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const postById = await getPostById(id);
    res.json(postById);
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: "something went wrong" });
  }
});

app.get("/spacecrafts/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const agencies = await getSpaceAgenciesDataById(id);
    res.json(agencies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: "something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`listing on the 3100 port`);
});
