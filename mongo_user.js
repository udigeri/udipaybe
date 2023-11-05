const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const User = require("./models/user");

if (process.argv.length < 3) {
  console.log("Missing password as argument");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://udigeri:${password}@cluster0.z5dwrt9.mongodb.net/udiPayApp?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

User.deleteMany({ admin: { $in: [0, 1] } })
  .then(() => {
    console.log("All Users successfully deleted");
  })
  .catch((err) => {
    console.log(err);
  });

const user = new User({
  email: "root@udipay.com",
  password: "admin",
  admin: true,
  name: "Super Admin",
});

user.save().then((result) => {
  console.log("Init user saved!");
  mongoose.connection.close();
});

// User.find({ admin: { $in: [0, 1] } }).then((result) => {
//   console.log(result.length);
//   // result.forEach(user => {
//   //   console.log(user)
//   // })
//   mongoose.connection.close();
// });
