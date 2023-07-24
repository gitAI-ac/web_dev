const mongoose = require('mongoose');

const dotenv = require('dotenv');

const app = require(`${__dirname}/app`);

dotenv.config({ path: './config.env' });

process.env.NODE_ENV = 'production';

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log('DB connected');
  });

/* const Tour = mongoose.model('Tour', tourSchema);

const testTour = new Tour({
  name: 'Manali',
  rating: 4.6,
});

testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log('error : ', err);
  }); */

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});

//app.set('env')='production';
//app.env = 'production';
//console.log(app);

//console.log(app.env);
