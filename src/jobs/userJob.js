const schedule = require("node-schedule");
const commonController = require("../controllers/commonControllers");
const userSchema = require("../models/userSchema");

const sendAccountDeletionEmail = (userCreatedMailOptions) => {
  const currentDate = new Date();
  const futureDate = new Date(currentDate.getTime() + 1 * 60 * 1000);

  const sendAccountDeletionEmailJob = schedule.scheduleJob(futureDate, async () => {
    try {
      await commonController.sendEmail(userCreatedMailOptions);
    } catch (err) {
      console.error("Error sending email: ", err);
    }
  });
};

const userLocationReminder = async () => {
  const userLocationReminderJob = schedule.scheduleJob(
    "0 2 * * *",
    async () => {
      const usersWithoutLocation = await userSchema.aggregate([
        {
          $match: {
            isLocationSet: false,
          },
        },
      ]);

      usersWithoutLocation.map((item) => {
        const locationReminderMailOptions = {
          from: process.env.GMAILID,
          to: item.email,
          subject: `Location Reminder`,
          html: `
              <p>Dear ${item.fullName},</p>
              <p>your profile is incomplete.</p>
              <p>Please kindly set your location.</p>
              <p>Regards,<br>Team Backend</p>`,
        };

        commonController.sendEmail(locationReminderMailOptions);
      });
    }
  );

  // userLocationReminderJob.cancel();
};

module.exports = {
  sendAccountDeletionEmail,
  userLocationReminder,
};
