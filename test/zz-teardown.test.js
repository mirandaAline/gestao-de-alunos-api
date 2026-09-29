import mongoose from 'mongoose';

after(async () => {
  await mongoose.connection.close();
});
