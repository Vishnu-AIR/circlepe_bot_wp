const { Client, LocalAuth, MessageMedia, RemoteAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const axios = require("axios");
const readable = require("stream").Readable;
var cloudinary = require("cloudinary").v2;
const QueueBuffer = require("./queManager");
const accessGs = require("./xlsManager");
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
require("dotenv").config()

const qBuffer = new QueueBuffer();

cloudinary.config({
  cloud_name: "dm8sdasaq",
  api_key: "977366518288525",
  api_secret: "8AmYT93edjgiYX3pgRapi9OIP1s",
});

async function main() {

  mongoose.connection.on('connected', () => console.log('connected to db'));
  mongoose.connection.on('disconnected', () => console.log('db disconnected'));
  mongoose.connection.on('close', () => console.log('db close'));

  await mongoose.connect(process.env.MONGODB_URI)

  const store = new MongoStore({ mongoose: mongoose });

  const client = new Client({
    authStrategy: new RemoteAuth({
      clientId: "cp-bot-1",
      store: store,
      backupSyncIntervalMs: 60000,
    }),
    webVersionCache: {
      type: "remote",
      remotePath:
        "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    },
    puppeteer: {
      restartOnAuthFail: true,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',],
    }
  });



// const client = new Client({
//   authStrategy: new LocalAuth(),
//   webVersionCache: {
//     type: "remote",
//     remotePath:
//       "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
//   },
// });



client.on("loading_screen", (percent, message) => {
  console.log("LOADING SCREEN", percent, message);
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

client.on("auth_failure", (msg) => {
  // Fired if session restore was unsuccessful
  console.error("AUTHENTICATION FAILURE", msg);
});

client.on("ready", () => {
  console.log("Client is ready!");
});

// async function convertImageToBase64(imageUrl) {
//   try {
//     // Fetch the image as a binary data
//     const response = await axios.get(imageUrl, {
//       responseType: 'arraybuffer'
//     });

//     // Convert the binary data to a Buffer
//     const buffer = Buffer.from(response.data, 'binary');

//     // Convert the Buffer to a Base64 string
//     const base64Image = buffer.toString('base64');

//     // Add MIME type for image (e.g., jpeg, png)
//     const mimeType = response.headers['content-type'];
//     const base64ImageWithMime = `data:${mimeType};base64,${base64Image}`;

//     return base64ImageWithMime;
//   } catch (error) {
//     console.error('Error converting image to Base64:', error);
//     throw error;
//   }
// }

// async function uploadImg(fileBuffer, fid) {
//   ts = date.now();

//   const uploadResult = await new Promise((resolve) => {
//     cloudinary.uploader
//       .upload_stream(
//         {
//           public_id: "myfolder/" + fid + "/" + ts.toString(),
//           access_mode: "public",
//         },
//         (error, uploadResult) => {
//           if (error) {
//             return false;
//           }
//           return resolve(uploadResult);
//         }
//       )
//       .end(fileBuffer);
//   });
//   console.log(uploadResult);
// }

client.on("message_create", async (msg) => {
  // onsole.log(msg);

  let fromId = msg.from.split("@")[0];

  if (!fromId.includes("9625237699") && msg.hasMedia) {
    console.log(msg.from,msg.body,msg.author);

    const media = await msg.downloadMedia();

    const fileBuffer = Buffer.from(media.data, "base64");
    
    
    if(qBuffer.contains(fromId)===false){
      console.log("create");
      console.log("enque");
     let ts = Date.now();
     let qId = fromId+`_${ts}`;
      qBuffer.enqueue(qId, fileBuffer);
    }else{
      console.log("enque");
      qBuffer.enqueue(qBuffer.contains(fromId), fileBuffer);
    }
    console.log("queId : "+qBuffer.contains(fromId));
    // qBuffer.enqueue(msg.from.split("@")[0], fileBuffer);
    // ts = Date.now()
  } else  {
    if ( msg.body.includes("done") || msg.body.includes("Done")) {
      fromId = msg.from.split("@")[0];
      let sendi = true;
      
      console.log("uploading...",qBuffer.getQueue(qBuffer.contains(fromId)));
      const qBuffArr= qBuffer.getQueue(qBuffer.contains(fromId))
      for (let pi = 0; pi < qBuffArr.length; pi++) {
        // console.log("currentQue_to_upload:",fromId,qBuffer.getQueue(qBuffer.contains(fromId)).length);
        let imgtu = qBuffArr[pi];
        console.log("done: ",pi);
        const uploadResult = await new Promise((resolve) => {
          cloudinary.uploader
            .upload_stream(
              {
                // public_id: `cp_${ts}`,
                access_mode: "public",
                use_filename: true,
                folder: `cp_${qBuffer.contains(fromId).split("_")[1]}`
                
              },
              (error, uploadResult) => {
                if (error) {
                  return false;
                }
                return resolve(uploadResult);
              }
            )
            .end(imgtu);
        });
         
        
        if(pi==1){
          client.sendMessage(msg.from, uploadResult.secure_url);
        }
        sendi = false

        
      }

      // while (qBuffer.isEmpty()) {
      //   let imgtu = qBuffer.dequeue(msg.from.split("@")[0]);
      //   console.log("dequing...")
      //   const uploadResult = await new Promise((resolve) => {
      //     cloudinary.uploader
      //       .upload_stream(
      //         {
      //           // public_id: `cp_${ts}`,
      //           access_mode: "public",
      //           use_filename: true,
      //           folder: `cp_${ts}`
                
      //         },
      //         (error, uploadResult) => {
      //           if (error) {
      //             return false;
      //           }
      //           return resolve(uploadResult);
      //         }
      //       )
      //       .end(imgtu);
      //   });
         
        
      //   if(sendi){
      //     client.sendMessage(msg.from, uploadResult.secure_url);
      //   }
      //   sendi = false
        
      // }
      // client.sendMessage(msg.from, uploadResult.secure_url);
      
      console.log("flushing:",qBuffer.contains(fromId))
      qBuffer.flush(qBuffer.contains(fromId));
      return;
      
    }

    if (!msg.from.includes("9625237699") && msg.body.includes("cp_")) {
      let sfIf = msg.from
      const id = msg.body.split("cp_")[1].split("/")[0];
      console.log(id);
      cloudinary.api
        .resources({
          resource_type: "image",
          type: "upload",
          prefix: "cp_"+id,
        })
        .then(async function  (result, error) {
          // console.log(result);
          console.log(error);
          if(error){
            return
          }
          
          console.log(result.resources.length);
          for (let index = 0; index < result.resources.length; index++) {
            const element = result.resources[index];
            console.log(element.secure_url)
            const media = await MessageMedia.fromUrl(element.secure_url);
            //console.log(media);
            client.sendMessage(sfIf,media)
            
            
          }
          // while(i<result.resources.length){
            
          //   // const fb = await convertImageToBase64(result.resources[i].secure_url);
          //   // const media = new MessageMedia.fromUrl(result.resources[i].secure_url);
          //   // console.log(media);
          //   // client.sendMessage(msg.from,media)
          //   i++;
          // }
          
         
          
        });
        accessGs(0, msg.body.trim()).then(
          async (result) =>
            await client.sendMessage(
              msg.from,
              `*CirclePe Property*\n\n${result?.bhk} BHK ${
                result?.furnishing
              } Furnished Flat in ${result?.address} ,${
                result?.location
              }\n\nRent: ${result?.rent?.toFixed(
                0
              )} (inclusive maintenance)\n\nOpen to All\nAvailability ${
                result?.availability
              }\n\nPhotos: ${result?.photo_link}`
            )
        );
        //ts = Date.now()
    }else if(!msg.from.includes("9625237699") ){
      accessGs(0, msg.body.trim()).then(
        async (result) =>
          await client.sendMessage(
            msg.from,
            `*CirclePe Property*\n\n${result?.bhk} BHK ${
              result?.furnishing
            } Furnished Flat in ${result?.address} ,${
              result?.location
            }\n\nRent: ${result?.rent?.toFixed(
              0
            )} (inclusive maintenance)\n\nOpen to All\nAvailability ${
              result?.availability
            }\n\nPhotos: ${result?.photo_link}`
          )
      );
    }
  }
});

client.initialize();
}
main()
