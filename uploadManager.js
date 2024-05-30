class Action {
    static async uploalImg (fileBuffer,id) {

        ts = date.now();


        return uploadResult = await new Promise((resolve) => {
            cloudinary.uploader.upload_stream({public_id: "myfolder/"+id+"/"+ts.toString(),},(error, uploadResult) => {
                 if(error){
                     return false;
                 }
                 return resolve(uploadResult);
             }).end(fileBuffer);
         })
    }

    static getImg(id){

    }

}