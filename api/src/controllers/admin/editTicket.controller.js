const Registration = require("../../models/tickets.model");

const VALID_CONFERENCES = ["cc-western", "cc-northern", "cc-eastern", "cape", "ncsa", "other"];
const VALID_PACKAGES = ["basic", "basicPack", "halfPack", "fullPack", "withPack", "withoutPack"];
const PACKS_NEEDING_SIZE = ["basicPack", "halfPack", "fullPack", "withPack"];
const VALID_HOODIE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

const editTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: "Ticket ID is required",
      });
    }

    const existingRegistration = await Registration.findOne({ ticketId });
    if (!existingRegistration) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const {
      firstName, surname, email, contactNumber, conference,
      gender, age, hoodieSize, churchInsured,
    } = req.body;
    const pkg = req.body.package;

    if (!firstName || !surname || !email || !contactNumber || !conference || !gender || !pkg) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: firstName, surname, email, contactNumber, conference, gender, package",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (age !== undefined && age !== "" && age !== null) {
      const ageNumber = parseInt(age);
      if (isNaN(ageNumber) || ageNumber < 1 || ageNumber > 120) {
        return res.status(400).json({ success: false, message: "Age must be between 1 and 120" });
      }
    }

    if (!VALID_CONFERENCES.includes(conference)) {
      return res.status(400).json({ success: false, message: "Invalid conference selection" });
    }

    if (!VALID_PACKAGES.includes(pkg)) {
      return res.status(400).json({ success: false, message: "Invalid package selection" });
    }

    if (PACKS_NEEDING_SIZE.includes(pkg)) {
      if (!hoodieSize || !VALID_HOODIE_SIZES.includes(hoodieSize)) {
        return res.status(400).json({
          success: false,
          message: "Valid hoodie size is required for this package",
        });
      }
    }

    if (!["male", "female"].includes(gender.toLowerCase())) {
      return res.status(400).json({ success: false, message: "Gender must be either male or female" });
    }

    const updateData = {
      firstName: firstName.trim(),
      surname: surname.trim(),
      email: email.toLowerCase().trim(),
      contactNumber: contactNumber.trim(),
      conference,
      gender: gender.toLowerCase(),
      package: pkg,
      churchInsured: churchInsured === "true" || churchInsured === true ? "true" : "false",
    };

    if (age !== undefined && age !== "" && age !== null) {
      updateData.age = parseInt(age);
    }

    if (hoodieSize) {
      updateData.hoodieSize = hoodieSize;
    }

    if (req.body.passportPhoto && req.body.passportPhoto !== existingRegistration.passportPhoto) {
      updateData.passportPhoto = req.body.passportPhoto;
    }

    const updatedRegistration = await Registration.findOneAndUpdate(
      { ticketId },
      {
        $set: updateData,
        $push: {
          statusComments: {
            status: existingRegistration.status,
            comment: "Ticket details updated by admin",
            createdAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      data: {
        ticketId: updatedRegistration.ticketId,
        firstName: updatedRegistration.firstName,
        surname: updatedRegistration.surname,
        email: updatedRegistration.email,
        contactNumber: updatedRegistration.contactNumber,
        conference: updatedRegistration.conference,
        gender: updatedRegistration.gender,
        age: updatedRegistration.age,
        package: updatedRegistration.package,
        hoodieSize: updatedRegistration.hoodieSize,
        passportPhoto: updatedRegistration.passportPhoto,
        paymentProof: updatedRegistration.paymentProof,
        status: updatedRegistration.status,
        statusComments: updatedRegistration.statusComments,
        churchInsured: updatedRegistration.churchInsured,
        _id: updatedRegistration._id,
        createdAt: updatedRegistration.createdAt,
      },
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({
      success: false,
      message: "Error updating ticket",
      error: error.message,
    });
  }
};

module.exports = editTicket;
