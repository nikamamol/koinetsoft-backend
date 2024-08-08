const express = require("express");


const {
    signup,
    login,
    logout,
    sendOtp,
    verifyOtp,
    accessuser,
    getAllUsers,
    viewUserById,
    updateUser,
    deleteUserById,
    inviteagency,
    myAgencyData,
    updateAgency,
    viewAgencyById,
    deleteAgencyById,
    addClient,
    viewClient,
    updateClient,
    viewClientDetails,
    deleteClient,
    uploadCsv,
    createCampaign,
    getAllCampaigns,
    updateCampaignById,
    getCampaignById,
    addTemplate,
    getTemplates,
    getTemplateById,
} = require("../controller/auth");

const UserAuthRouter = express.Router();

UserAuthRouter.post("/signup", signup);
UserAuthRouter.post("/login", login);
UserAuthRouter.post("/logout", logout);
UserAuthRouter.post("/send-otp", sendOtp);
UserAuthRouter.post("/verify-otp", verifyOtp);
// user
UserAuthRouter.post("/addnewuser", accessuser);
UserAuthRouter.get("/getallusers", getAllUsers);
UserAuthRouter.get("/viewuserbyid/:id", viewUserById);
UserAuthRouter.put("/updateuser/:id", updateUser);
UserAuthRouter.delete("/deleteuser/:id", deleteUserById);
// add agency
UserAuthRouter.post("/invitagency", inviteagency);
UserAuthRouter.get("/myagencies", myAgencyData);
UserAuthRouter.get("/viewAgencyDetails/:id", viewAgencyById);
UserAuthRouter.put("/updateAgency/:id", updateAgency);
UserAuthRouter.delete("/deletevendor/:id", deleteAgencyById);

// billing
UserAuthRouter.post("/addnewClient", addClient);
UserAuthRouter.get("/getAllClient", viewClient);
UserAuthRouter.get("/clientDetails/:id", viewClientDetails);
UserAuthRouter.put("/updateClient/:id", updateClient);
UserAuthRouter.delete("/deleteClient/:id", deleteClient);

// create campaign
UserAuthRouter.post("/createcampaign", createCampaign);
UserAuthRouter.get('/getCampaignsData', getAllCampaigns);
UserAuthRouter.get('/getCampaignsDataById/:id', getCampaignById);
UserAuthRouter.put('/updateCampaignById/:id', updateCampaignById);

// rpf 
UserAuthRouter.post("/uplaodcsv", uploadCsv);

// create template
UserAuthRouter.post("/createTemplate", addTemplate);
UserAuthRouter.get("/getTemplateData", getTemplates);
UserAuthRouter.get('/templates/:id', getTemplateById);






module.exports = UserAuthRouter;