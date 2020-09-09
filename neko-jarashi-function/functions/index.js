const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
admin.initializeApp();
const db = admin.firestore();
const fcm = functions.config().fcm;

exports.fcmNotification = functions.region('asia-northeast1').firestore
  .document("notifications/{doc}")
  .onWrite(async (change, context) => {
    const document = change.after.exists ? change.after.data() : null;
    if (!document) return;

    const notification = change.after.data();

    if (!notification.isPost) return

    const usersData = await db.collection('users').where('job', "==", "student").get();

    const fcmTokenMap = []
    usersData.forEach(user => {
      fcmTokenMap.push(user.data().fcmToken)
    })

    fcmTokenMap.forEach(async (item, index) => {
      const url = "https://fcm.googleapis.com/fcm/send";
      const payload = {
        to: item,
        notification: {
          title: notification.title,
          body: notification.body,
          url: "/",
        },
      };
      const opts = {
        method: "post",
        headers: {
          Authorization: `key=${fcm.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      };

      await fetch(url, opts).then((res) => console.log(res.status));
    })
  });
