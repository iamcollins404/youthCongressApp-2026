import axios from "axios";
import html2canvas from "html2canvas";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import IDCard from "../../components/idcard/IDCard";
import Footer from "../../components/landing/footer";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { API_URL } from "../../utils/api";
import { safeParseDate, formatDate, formatDateTime } from "../../utils/date";

const PKG_LABELS = {
  basic: 'Basic — No Pack (R450)',
  basicPack: 'Basic Pack — Jacket (R750)',
  halfPack: 'Half Pack — Jacket & Bag (R950)',
  fullPack: 'Full Pack — Jacket, Bag, Cup & Socks (R1 200)',
  withPack: 'Including Congress Pack (R750)',
  withoutPack: 'Without Congress Pack (R450)',
}
const PKG_NEEDS_SIZE = ['basicPack', 'halfPack', 'fullPack', 'withPack']

const CONF_LABELS = {
  'ncsa': 'Northern Conference of South Africa',
  'cape-eastern': 'Cape Conference - Eastern Region',
  'cape-northern': 'Cape Conference - Northern Region',
  'cape-western': 'Cape Conference - Western Region',
  'cc-western': 'Cape Conference - Western Region',
  'cc-northern': 'Cape Conference - Northern Region',
  'cc-eastern': 'Cape Conference - Eastern Region',
  'cape': 'The Cape Conference',
}

function displayPkg(val) { return PKG_LABELS[val] || val }
function displayConf(val) { return CONF_LABELS[val] || val }
function pkgFromLabel(label) {
  const entry = Object.entries(PKG_LABELS).find(([, v]) => label === v || label.includes(v))
  return entry ? entry[0] : label
}

function AdminTickets() {
  const [adminEmail, setAdminEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [conferenceFilter, setConferenceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [statusComment, setStatusComment] = useState("");
  const [statusUpdateError, setStatusUpdateError] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const [_showIDCardModal, setShowIDCardModal] = useState(false);
  const [idCardData, setIdCardData] = useState(null);
  const [_isDownloadingCards, setIsDownloadingCards] = useState(false);
  const [_downloadProgress, setDownloadProgress] = useState(0);

  const [showIDCardPreviewModal, setShowIDCardPreviewModal] = useState(false);
  const [selectedIDCardTicket, setSelectedIDCardTicket] = useState(null);
  const [selectedIDCardPhotoDataUrl, setSelectedIDCardPhotoDataUrl] =
    useState(null);
  const [isIDCardPhotoLoading, setIsIDCardPhotoLoading] = useState(false);
  const [isIDCardDownloading, setIsIDCardDownloading] = useState(false);

  // Add New Ticket Modal States
  const [isAddTicketModalOpen, setIsAddTicketModalOpen] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [createTicketError, setCreateTicketError] = useState(null);
  const [newTicketData, setNewTicketData] = useState({
    firstName: "",
    surname: "",
    email: "",
    contactNumber: "",
    conference: "",
    gender: "",
    age: "",
    package: "",
    hoodieSize: "",
    churchInsured: "true",
    status: "pending",
    statusComment: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState({
    passportPhoto: null,
    paymentProof: null,
  });

  // File upload loading states
  const [isUploadingPassportPhoto, setIsUploadingPassportPhoto] =
    useState(false);
  const [isUploadingPaymentProof, setIsUploadingPaymentProof] = useState(false);

  // Edit ticket state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTicketData, setEditTicketData] = useState({});
  const [isEditingTicket, setIsEditingTicket] = useState(false);
  const [editTicketError, setEditTicketError] = useState(null);
  const [editUploadedFiles, setEditUploadedFiles] = useState({
    passportPhoto: null,
  });
  const [isUploadingEditPassportPhoto, setIsUploadingEditPassportPhoto] =
    useState(false);

  const navigate = useNavigate();

  // Fetch tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/tickets`);
        if (response.data) {
          // Map API response to our ticket format and sort by createdAt
          const formattedTickets = response.data
            .map((ticket) => {
              const createdAt = safeParseDate(ticket.createdAt);
              return {
                id: ticket.ticketId,
                firstName: ticket.firstName,
                surname: ticket.surname,
                email: ticket.email,
                conference: displayConf(ticket.conference),
                package: displayPkg(ticket.package),
                rawPackage: ticket.package,
                hoodieSize: ticket.hoodieSize,
                registrationDate: createdAt ? createdAt.toISOString().split("T")[0] : "",
                status:
                  ticket.status === "declined"
                    ? "Declined"
                    : ticket.status.charAt(0).toUpperCase() +
                      ticket.status.slice(1),
                age: ticket.age,
                gender: ticket.gender,
                contactNumber: ticket.contactNumber,
                churchInsured: ticket.churchInsured,
                passportPhoto: ticket.passportPhoto,
                paymentProof: ticket.paymentProof,
                _id: ticket._id,
                statusComments: ticket.statusComments || [],
                createdAt: createdAt ? createdAt.getTime() : 0,
              };
            })
            .sort((a, b) => b.createdAt - a.createdAt); // Sort by createdAt in descending order (newest first)
          setTickets(formattedTickets);
        }
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Check screen size for responsive design
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Check if admin is logged in
  useEffect(() => {
    const email = sessionStorage.getItem("adminEmail");
    if (!email) {
      navigate("/admin");
      return;
    }
    setAdminEmail(email);
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem("adminEmail");
    navigate("/admin");
  };

  // Handle export
  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      // Filter tickets based on current search and status filters
      const dataToExport = filteredTickets.map((ticket) => ({
        "Ticket ID": ticket.id,
        "First Name": ticket.firstName,
        Surname: ticket.surname,
        Email: ticket.email,
        "Contact Number": ticket.contactNumber,
        Conference: ticket.conference,
        Package: ticket.package,
        "Registration Date": formatDateTime(ticket.registrationDate, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        Status: ticket.status,
        Age: ticket.age,
        Gender: ticket.gender,
        "Church Insured": ticket.churchInsured ? "Yes" : "No",
      }));

      // Simulate API call for export
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (format === "csv") {
        // Create CSV string
        const headers = Object.keys(dataToExport[0]);
        const csvContent = [
          headers.join(","),
          ...dataToExport.map((row) =>
            headers.map((header) => `"${row[header] || ""}"`).join(",")
          ),
        ].join("\n");

        // Create and download file for download
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `tickets_export_${new Date().toISOString().split("T")[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === "pdf") {
        // For PDF, we'll use html2pdf.js
        // You'll need to add this dependency: npm install html2pdf.js
        const html2pdf = await import("html2pdf.js");

        // Create a table HTML structure
        const tableHtml = `
          <div style="padding: 20px;">
            <h2 style="text-align: center; margin-bottom: 20px;">Tickets Export</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  ${Object.keys(dataToExport[0])
                    .map(
                      (header) =>
                        `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f3f4f6;">${header}</th>`
                    )
                    .join("")}
                </tr>
              </thead>
              <tbody>
                ${dataToExport
                  .map(
                    (row) => `
                  <tr>
                    ${Object.values(row)
                      .map(
                        (value) =>
                          `<td style="border: 1px solid #ddd; padding: 8px;">${value}</td>`
                      )
                      .join("")}
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `;

        const element = document.createElement("div");
        element.innerHTML = tableHtml;

        const opt = {
          margin: 1,
          filename: `tickets_export_${
            new Date().toISOString().split("T")[0]
          }.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
        };

        await html2pdf().set(opt).from(element).save();
      } else if (format === "docx") {
        // For DOCX, we'll use docx library
        // You'll need to add this dependency: npm install docx
        const { Document, Paragraph, Table, TableRow, TableCell, BorderStyle } =
          await import("docx");

        const headers = Object.keys(dataToExport[0]);
        const rows = dataToExport.map((row) => Object.values(row));

        const table = new Table({
          rows: [
            new TableRow({
              children: headers.map(
                (header) =>
                  new TableCell({
                    children: [new Paragraph(header)],
                    shading: { fill: "F3F4F6" },
                  })
              ),
            }),
            ...rows.map(
              (row) =>
                new TableRow({
                  children: row.map(
                    (cell) =>
                      new TableCell({
                        children: [new Paragraph(cell.toString())],
                      })
                  ),
                })
            ),
          ],
        });

        const doc = new Document({
          sections: [
            {
              children: [new Paragraph("Tickets Export"), table],
            },
          ],
        });

        const blob = await doc.save("blob");
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `tickets_export_${
          new Date().toISOString().split("T")[0]
        }.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setExportSuccess(true);
      setTimeout(() => {
        setIsExportModalOpen(false);
        setExportSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle status change
  const handleStatusChange = (ticketId, newStatus) => {
    setPendingStatus(newStatus);
  };

  // Handle save update
  const handleSaveUpdate = async () => {
    if (!selectedTicket || !pendingStatus) return;

    setIsSaving(true);
    setStatusUpdateError(null);

    try {
      // Convert status to match backend expectations
      const backendStatus = pendingStatus.toLowerCase();

      const response = await axios.patch(
        `${API_URL}/tickets/${selectedTicket.id}/status`,
        {
          status: backendStatus,
          comment:
            statusComment ||
            `Status updated to ${backendStatus} by ${adminEmail}`,
        }
      );

      if (response.data.success) {
        // Update local state with new status and comments, but maintain original sorting
        setTickets(
          tickets.map((t) =>
            t.id === selectedTicket.id
              ? {
                  ...t,
                  status: pendingStatus,
                  statusComments: response.data.data.comments,
                }
              : t
          )
        );
        setStatusComment(""); // Clear comment after successful update
        setPendingStatus(null); // Reset pending status
        setIsModalOpen(false); // Close modal after success
        setSelectedTicket(null);
      } else {
        setStatusUpdateError("Failed to update ticket status");
      }
    } catch (err) {
      console.error("Error updating ticket status:", err);
      setStatusUpdateError(
        err.response?.data?.message || "Error updating ticket status"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle new ticket form input changes
  const handleNewTicketInputChange = (field, value) => {
    setNewTicketData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle file selection for new ticket (upload to external service)
  const handleSingleFileUpload = async (file, fileType) => {
    if (!file) return;

    // Validate file type and size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setCreateTicketError(`File size too large. Maximum allowed size is 5MB.`);
      return;
    }

    // Validate file type
    if (fileType === "passportPhoto") {
      if (!file.type.startsWith("image/")) {
        setCreateTicketError(
          "Passport photo must be an image file (JPG, PNG)."
        );
        return;
      }
    } else if (fileType === "paymentProof") {
      const allowedTypes = [
        "image/",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const isValidType = allowedTypes.some(
        (type) => file.type.startsWith(type) || file.type.includes(type)
      );
      if (!isValidType) {
        setCreateTicketError(
          "Payment proof must be an image, PDF, or Word document."
        );
        return;
      }
    }

    // Set loading state
    if (fileType === "passportPhoto") {
      setIsUploadingPassportPhoto(true);
    } else {
      setIsUploadingPaymentProof(true);
    }

    try {
      // Upload file via our API (ForUploads)
      const formData = new FormData();
      formData.append("file", file);

      const uploadUrl = `${API_URL.replace(/\/api\/?$/, "")}/api/uploads/file`;
      const response = await axios.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.success && response.data?.file?.url) {
        setUploadedFiles((prev) => ({
          ...prev,
          [fileType]: {
            url: response.data.file.url,
            fileName: response.data.file.name,
            originalName: file.name,
          },
        }));

        setCreateTicketError(null);
      } else {
        setCreateTicketError(
          `Failed to upload ${
            fileType === "passportPhoto" ? "passport photo" : "payment proof"
          }`
        );
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setCreateTicketError(
        `Failed to upload ${
          fileType === "passportPhoto" ? "passport photo" : "payment proof"
        }: ${error.response?.data?.message || error.message}`
      );
    } finally {
      // Clear loading state
      if (fileType === "passportPhoto") {
        setIsUploadingPassportPhoto(false);
      } else {
        setIsUploadingPaymentProof(false);
      }
    }
  };

  // Handle drag and drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, fileType) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleSingleFileUpload(files[0], fileType);
    }
  };

  // Handle creating new ticket
  const handleCreateTicket = async () => {
    setIsCreatingTicket(true);
    setCreateTicketError(null);

    try {
      // Validate required fields
      const requiredFields = [
        "firstName",
        "surname",
        "email",
        "contactNumber",
        "conference",
        "gender",
        "package",
      ];
      const missingFields = requiredFields.filter(
        (field) => !newTicketData[field]
      );

      if (missingFields.length > 0) {
        setCreateTicketError(
          `Missing required fields: ${missingFields.join(", ")}`
        );
        return;
      }

      // Validate hoodie size for Congress Pack
      if (PKG_NEEDS_SIZE.includes(newTicketData.package) && !newTicketData.hoodieSize) {
        setCreateTicketError(
          "Jacket size is required for pack packages"
        );
        return;
      }

      // Validate file uploads
      if (!uploadedFiles.passportPhoto || !uploadedFiles.passportPhoto.url) {
        setCreateTicketError("Passport photo is required");
        return;
      }

      if (!uploadedFiles.paymentProof || !uploadedFiles.paymentProof.url) {
        setCreateTicketError("Payment proof is required");
        return;
      }

      // Create request payload with file URLs
      const ticketData = {
        ...newTicketData,
        passportPhoto: uploadedFiles.passportPhoto.url,
        paymentProof: uploadedFiles.paymentProof.url,
      };

      const response = await axios.post(
        `${API_URL}/tickets/admin/create`,
        ticketData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Add new ticket to the list and sort by creation date
        const newTicket = {
          id: response.data.data.ticketId,
          firstName: response.data.data.firstName,
          surname: response.data.data.surname,
          email: response.data.data.email,
          conference: displayConf(response.data.data.conference),
          package: displayPkg(response.data.data.package),
          rawPackage: response.data.data.package,
          hoodieSize: response.data.data.hoodieSize,
          registrationDate: new Date().toISOString().split("T")[0],
          status:
            response.data.data.status.charAt(0).toUpperCase() +
            response.data.data.status.slice(1),
          age: response.data.data.age,
          gender: response.data.data.gender,
          contactNumber: response.data.data.contactNumber,
          churchInsured: response.data.data.churchInsured,
          passportPhoto: response.data.data.passportPhoto,
          paymentProof: response.data.data.paymentProof,
          _id: response.data.data._id,
          statusComments: response.data.data.statusComments || [],
          createdAt: new Date().getTime(),
        };

        setTickets((prevTickets) => [newTicket, ...prevTickets]);

        // Reset form and close modal
        setNewTicketData({
          firstName: "",
          surname: "",
          email: "",
          contactNumber: "",
          conference: "",
          gender: "",
          age: "",
          package: "",
          hoodieSize: "",
          churchInsured: "true",
          status: "pending",
          statusComment: "",
        });
        setUploadedFiles({
          passportPhoto: null,
          paymentProof: null,
        });
        setIsAddTicketModalOpen(false);
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      setCreateTicketError(
        error.response?.data?.message || "Failed to create ticket"
      );
    } finally {
      setIsCreatingTicket(false);
    }
  };

  // Handle opening the ticket modal
  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
    setIsEditMode(false); // Start in view mode
    setEditTicketError(null);
  };

  // Handle entering edit mode
  const handleEnterEditMode = () => {
    console.log("Entering edit mode with selectedTicket:", selectedTicket);
    setIsEditMode(true);

    const confReverse = Object.fromEntries(Object.entries(CONF_LABELS).map(([k, v]) => [v, k]))
    const conferenceValue = confReverse[selectedTicket.conference] || selectedTicket.conference || "cc-western";

    const packageValue = selectedTicket.rawPackage || pkgFromLabel(selectedTicket.package);

    const editData = {
      firstName: selectedTicket.firstName,
      surname: selectedTicket.surname,
      email: selectedTicket.email,
      contactNumber: selectedTicket.contactNumber,
      conference: conferenceValue,
      gender: selectedTicket.gender,
      age: selectedTicket.age ? selectedTicket.age.toString() : "",
      package: packageValue,
      hoodieSize: selectedTicket.hoodieSize || "",
      churchInsured: selectedTicket.churchInsured ? "true" : "false",
    };

    console.log("Setting edit ticket data:", editData);
    setEditTicketData(editData);

    setEditUploadedFiles({
      passportPhoto: null,
    });
  };

  // Handle edit form input changes
  const handleEditInputChange = (field, value) => {
    setEditTicketData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle passport photo upload for edit mode (upload to external service)
  const handleEditSingleFileUpload = async (file) => {
    if (!file) return;

    // Validate file type and size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setEditTicketError(`File size too large. Maximum allowed size is 5MB.`);
      return;
    }

    // Validate file type for passport photo
    if (!file.type.startsWith("image/")) {
      setEditTicketError("Passport photo must be an image file (JPG, PNG).");
      return;
    }

    setIsUploadingEditPassportPhoto(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadUrl = `${API_URL.replace(/\/api\/?$/, "")}/api/uploads/file`;
      const response = await axios.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.success && response.data?.file?.url) {
        setEditUploadedFiles((prev) => ({
          ...prev,
          passportPhoto: {
            url: response.data.file.url,
            fileName: response.data.file.name,
            originalName: file.name,
          },
        }));

        setEditTicketError(null);
      } else {
        setEditTicketError("Failed to upload passport photo");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setEditTicketError(
        `Failed to upload passport photo: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsUploadingEditPassportPhoto(false);
    }
  };

  // Handle edit form submission
  const handleEditTicket = async () => {
    if (!selectedTicket) return;

    setIsEditingTicket(true);
    setEditTicketError(null);

    try {
      // Create request payload
      const updateData = { ...editTicketData };

      // Add passport photo URL if new one was uploaded
      if (
        editUploadedFiles.passportPhoto &&
        editUploadedFiles.passportPhoto.url
      ) {
        updateData.passportPhoto = editUploadedFiles.passportPhoto.url;
      }

      // Make API call to update ticket
      const response = await axios.patch(
        `${API_URL}/tickets/${selectedTicket.id}/edit`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Update the ticket in local state
        const updatedTicket = {
          id: response.data.data.ticketId,
          firstName: response.data.data.firstName,
          surname: response.data.data.surname,
          email: response.data.data.email,
          conference: displayConf(response.data.data.conference),
          package: displayPkg(response.data.data.package),
          rawPackage: response.data.data.package,
          hoodieSize: response.data.data.hoodieSize,
          registrationDate: selectedTicket.registrationDate,
          status:
            response.data.data.status.charAt(0).toUpperCase() +
            response.data.data.status.slice(1),
          age: response.data.data.age,
          gender: response.data.data.gender,
          contactNumber: response.data.data.contactNumber,
          churchInsured: response.data.data.churchInsured,
          passportPhoto: response.data.data.passportPhoto,
          paymentProof: response.data.data.paymentProof,
          _id: response.data.data._id,
          statusComments: response.data.data.statusComments || [],
          createdAt: selectedTicket.createdAt,
        };

        // Update tickets array
        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.id === selectedTicket.id ? updatedTicket : ticket
          )
        );

        // Update selected ticket for modal
        setSelectedTicket(updatedTicket);

        // Exit edit mode
        setIsEditMode(false);
        setEditTicketData({});
        setEditUploadedFiles({ passportPhoto: null });
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      setEditTicketError(
        error.response?.data?.message || "Failed to update ticket"
      );
    } finally {
      setIsEditingTicket(false);
    }
  };

  // Handle canceling edit mode
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditTicketData({});
    setEditUploadedFiles({ passportPhoto: null });
    setEditTicketError(null);
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter !== "all" && ticket.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (conferenceFilter !== "all" && !ticket.conference.toLowerCase().includes(conferenceFilter.toLowerCase())) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return [ticket.id, ticket.firstName, ticket.surname, ticket.email, ticket.contactNumber]
      .some((f) => f && f.toString().toLowerCase().includes(q));
  });

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTickets = filteredTickets.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, conferenceFilter]);

  const renderStatusBadge = (status) => {
    const styles = {
      Approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
      Pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
      Declined: "bg-red-500/15 text-red-400 border-red-500/20",
    };
    return (
      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${styles[status] || styles.Declined}`}>
        {status}
      </span>
    );
  };

  // Render table view for desktop
  const _renderTableView = () => (
    <div className="mt-4 flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ticket ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Conference
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Package
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ticket.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.firstName} {ticket.surname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.conference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.package}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {renderStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openTicketModal(ticket)}
                        className="text-[#00c8ff] hover:text-[#4db8ff]"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // Render card view for mobile
  const renderCardView = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse"></div>
              </div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div className="text-sm font-medium text-[#00c8ff]">
                {ticket.id}
              </div>
              {renderStatusBadge(ticket.status)}
            </div>
            <div className="p-4">
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {ticket.firstName} {ticket.surname}
                </div>
                <div className="text-sm text-gray-500">{ticket.email}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    Conference
                  </div>
                  <div className="text-sm text-gray-900 mt-1">
                    {ticket.conference}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    Package
                  </div>
                  <div className="text-sm text-gray-900 mt-1">
                    {ticket.package}
                  </div>
                </div>
                {ticket.hoodieSize && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">
                      Jacket Size
                    </div>
                    <div className="text-sm text-gray-900 mt-1">
                      {ticket.hoodieSize}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    Status
                  </div>
                  <div className="relative mt-1">
                    <select
                      className="text-sm text-gray-700 border border-gray-300 rounded-md bg-white px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-[#00c8ff] focus:border-[#00c8ff]"
                      value={ticket.status}
                      onChange={(e) =>
                        handleStatusChange(ticket.id, e.target.value)
                      }
                    >
                      <option value="Approved">Set Approved</option>
                      <option value="Pending">Set Pending</option>
                      <option value="Declined">Set Declined</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => openTicketModal(ticket)}
                  className="inline-flex items-center px-3 py-2 border border-teal-600 text-sm leading-4 font-medium rounded-md text-[#00c8ff] bg-white hover:bg-[#00c8ff]/10 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const _handleShowIDCard = (ticket) => {
    console.log("Ticket data for ID card:", ticket);
    console.log("Passport photo structure:", ticket.passportPhoto);

    setIdCardData({
      photoUrl: ticket.passportPhoto?.url || ticket.passportPhoto || "",
      name: `${ticket.firstName} ${ticket.surname}`,
      id: ticket.id,
      conference: ticket.conference,
      phone: ticket.contactNumber,
    });
    setShowIDCardModal(true);
  };

  const _handlePrintIDCard = async () => {
    if (!document.getElementById("idcard-print-area")) return;

    try {
      const element = document.getElementById("idcard-print-area");
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `id-card-${idCardData.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, "image/png");
    } catch (error) {
      console.error("Error generating ID card image:", error);
      alert("Failed to generate ID card image. Please try again.");
    }
  };

  const _downloadAllCards = async () => {
    console.log("Starting ID card download process...");
    const approvedTickets = filteredTickets.filter(
      (ticket) => ticket.status === "Approved"
    );
    console.log("Approved tickets found:", approvedTickets.length);

    if (approvedTickets.length === 0) {
      console.error("No approved tickets found to generate ID cards");
      alert("No approved tickets found to generate ID cards.");
      return;
    }

    // Open download page in new window
    const downloadWindow = window.open("", "_blank");
    if (!downloadWindow) {
      console.error("Failed to open download window - popup blocked");
      alert("Please allow popups for this website to download ID cards.");
      return;
    }
    console.log("Download window opened successfully");

    // Write basic HTML to the new window with improved styling
    downloadWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Downloading ID Cards</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 20px;
              background: #f3f4f6;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 0.5rem;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              max-width: 800px;
              width: 100%;
            }
            .progress-bar {
              width: 100%;
              height: 8px;
              background: #e5e7eb;
              border-radius: 4px;
              overflow: hidden;
              margin: 1rem 0;
            }
            .progress {
              height: 100%;
              background: #3b82f6;
              transition: width 0.3s ease;
            }
            .status {
              text-align: center;
              margin: 1rem 0;
              color: #4b5563;
            }
            .error {
              color: #dc2626;
              margin: 1rem 0;
              text-align: center;
            }
            .warning {
              color: #d97706;
              margin: 0.5rem 0;
              text-align: center;
              font-size: 0.875rem;
            }
            .success {
              color: #059669;
              margin: 0.5rem 0;
              text-align: center;
              font-size: 0.875rem;
            }
            button {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.375rem;
              cursor: pointer;
              width: 100%;
              font-weight: 500;
              transition: background-color 0.2s;
            }
            button:hover {
              background: #2563eb;
            }
            button:disabled {
              background: #93c5fd;
              cursor: not-allowed;
            }
            .stats {
              display: flex;
              justify-content: space-between;
              margin: 1rem 0;
              font-size: 0.875rem;
              color: #6b7280;
            }
            .status-container {
              max-height: 300px;
              overflow-y: auto;
              margin: 1rem 0;
              padding: 0.5rem;
              background: #fffbeb;
              border-radius: 0.375rem;
              border: 1px solid #fcd34d;
            }
            .status-item {
              padding: 0.5rem;
              border-bottom: 1px solid #fcd34d;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .status-item:last-child {
              border-bottom: none;
            }
            .status-item.success {
              background: #ecfdf5;
              border-color: #34d399;
            }
            .status-item.error {
              background: #fef2f2;
              border-color: #f87171;
            }
            .status-item.pending {
              background: #eff6ff;
              border-color: #60a5fa;
            }
            .status-icon {
              margin-right: 0.5rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 style="text-align: center; margin-bottom: 1rem;">Downloading ID Cards</h2>
            <div class="progress-bar">
              <div class="progress" style="width: 0%"></div>
            </div>
            <div class="stats">
              <span>Progress</span>
              <span class="progress-text">0%</span>
            </div>
            <div class="status">Preparing download...</div>
            <div class="status-container"></div>
            <button onclick="window.close()">Cancel Download</button>
          </div>
        </body>
      </html>
    `);

    setIsDownloadingCards(true);
    setDownloadProgress(0);
    console.log("Starting card processing...");

    try {
      // Process cards in smaller batches
      const batchSize = 5;
      const totalBatches = Math.ceil(approvedTickets.length / batchSize);
      let processedCards = 0;
      console.log(
        `Processing in batches of ${batchSize}, total batches: ${totalBatches}`
      );

      for (let i = 0; i < approvedTickets.length; i += batchSize) {
        const batch = approvedTickets.slice(i, i + batchSize);
        console.log(
          `Processing batch ${Math.floor(i / batchSize) + 1}/${totalBatches}`
        );

        // Process each card in the batch
        for (const ticket of batch) {
          try {
            console.log(`Processing ticket ID: ${ticket.id}`);
            console.log("Ticket data:", {
              photoUrl: ticket.passportPhoto?.url || ticket.passportPhoto,
              name: `${ticket.firstName} ${ticket.surname}`,
              id: ticket.id,
              conference: ticket.conference,
              phone: ticket.contactNumber,
            });

            // Generate ID card for each ticket
            const _cardData = {
              photoUrl: ticket.passportPhoto?.url || ticket.passportPhoto || "",
              name: `${ticket.firstName} ${ticket.surname}`,
              id: ticket.id,
              conference: ticket.conference,
              phone: ticket.contactNumber,
            };

            // Update progress
            processedCards++;
            const progress = Math.round(
              (processedCards / approvedTickets.length) * 100
            );
            setDownloadProgress(progress);
            console.log(
              `Progress: ${progress}% - Processed ${processedCards}/${approvedTickets.length}`
            );

            if (downloadWindow && !downloadWindow.closed) {
              // Update progress bar
              downloadWindow.document.querySelector(
                ".progress"
              ).style.width = `${progress}%`;
              downloadWindow.document.querySelector(
                ".progress-text"
              ).textContent = `${progress}%`;
              downloadWindow.document.querySelector(".status").textContent =
                "Processing cards...";

              // Add status item
              const statusContainer =
                downloadWindow.document.querySelector(".status-container");
              const statusItem = downloadWindow.document.createElement("div");
              statusItem.className = "status-item pending";
              statusItem.innerHTML = `
                <div>
                  <span class="status-icon">⏳</span>
                  Processing ID: ${ticket.id}
                </div>
                <div>Pending...</div>
              `;
              statusContainer.appendChild(statusItem);

              // Simulate processing delay
              await new Promise((resolve) => setTimeout(resolve, 500));

              // Update status to success
              statusItem.className = "status-item success";
              statusItem.innerHTML = `
                <div>
                  <span class="status-icon">✅</span>
                  ID: ${ticket.id} - ${ticket.firstName} ${ticket.surname}
                </div>
                <div>Success</div>
              `;
              console.log(`Successfully processed ticket ID: ${ticket.id}`);
            } else {
              console.warn("Download window was closed during processing");
            }
          } catch (error) {
            console.error(`Error processing card ${ticket.id}:`, error);
            console.error("Error details:", {
              message: error.message,
              stack: error.stack,
              ticket: ticket,
            });

            if (downloadWindow && !downloadWindow.closed) {
              const statusContainer =
                downloadWindow.document.querySelector(".status-container");
              const statusItem = downloadWindow.document.createElement("div");
              statusItem.className = "status-item error";
              statusItem.innerHTML = `
                <div>
                  <span class="status-icon">❌</span>
                  ID: ${ticket.id} - ${ticket.firstName} ${ticket.surname}
                </div>
                <div>Failed: ${error.message || "Unknown error"}</div>
              `;
              statusContainer.appendChild(statusItem);
            }
          }
        }
      }

      // Complete the process
      if (downloadWindow && !downloadWindow.closed) {
        downloadWindow.document.querySelector(".status").textContent =
          "Download completed! You can close this window.";
        downloadWindow.document.querySelector("button").textContent =
          "Close Window";
        console.log("Download process completed successfully");
      } else {
        console.warn("Download window was closed before completion");
      }
    } catch (error) {
      console.error("Fatal error in ID card generation:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });

      if (downloadWindow && !downloadWindow.closed) {
        downloadWindow.document.querySelector(".status").textContent =
          "Error occurred during download";
        downloadWindow.document.querySelector(".error").textContent =
          error.message;
        downloadWindow.document.querySelector("button").textContent =
          "Close Window";
      }
    } finally {
      console.log("Cleaning up download process...");
      setIsDownloadingCards(false);
      setDownloadProgress(0);
    }
  };

  const handleShowIDCardPreview = async (ticket) => {
    setSelectedIDCardTicket(ticket);
    setShowIDCardPreviewModal(true);
    setSelectedIDCardPhotoDataUrl(null);
    setIsIDCardPhotoLoading(false);
    if (ticket.passportPhoto) {
      setIsIDCardPhotoLoading(true);
      try {
        const base = API_URL.replace(/\/api\/?$/, "");
        const photoUrl = ticket.passportPhoto.startsWith("http")
          ? ticket.passportPhoto
          : `${base}${ticket.passportPhoto}`;
        const corsProxyUrl = "https://corsproxy.io/?";
        const fetchUrl = corsProxyUrl + encodeURIComponent(photoUrl);
        const response = await fetch(fetchUrl);
        const blob = await response.blob();
        const reader = new window.FileReader();
        reader.onloadend = () => {
          setSelectedIDCardPhotoDataUrl(reader.result);
          setIsIDCardPhotoLoading(false);
        };
        reader.readAsDataURL(blob);
      } catch {
        setSelectedIDCardPhotoDataUrl(null);
        setIsIDCardPhotoLoading(false);
      }
    }
  };

  // Add a ref for the IDCard
  const idCardRef = useRef(null);

  // Download handler
  const handleDownloadIDCard = async () => {
    if (!idCardRef.current || !selectedIDCardTicket) return;
    setIsIDCardDownloading(true);
    try {
      // Wait for ID card canvas to finish rendering (QR + images load async)
      await new Promise((r) => setTimeout(r, 600));
      const element = idCardRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        useCORS: true,
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const fullName =
        `${selectedIDCardTicket.firstName}_${selectedIDCardTicket.surname}`.replace(
          /\s+/g,
          ""
        );
      link.href = imgData;
      link.download = `${selectedIDCardTicket.id}_${fullName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsIDCardDownloading(false);
    }
  };

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showIDCardPreviewModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showIDCardPreviewModal]);

  return (
    <div className="min-h-screen bg-[#0c0f2e] flex flex-col">
      <AdminNavbar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="py-10 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold text-white">Manage Tickets</h1>
            <div className="mt-3 md:mt-0 flex space-x-3">
              <button type="button" onClick={() => setIsAddTicketModalOpen(true)}
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Ticket
              </button>
              <button type="button" onClick={() => setIsExportModalOpen(true)}
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Export
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                  <input type="search" placeholder="Search by name, email, ID or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#00c8ff] focus:border-[#00c8ff] transition-colors" />
                </div>
              </div>
              {/* Status Filter */}
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00c8ff] focus:border-[#00c8ff] min-w-[140px]">
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="declined">Declined</option>
              </select>
              {/* Conference Filter */}
              <select value={conferenceFilter} onChange={(e) => setConferenceFilter(e.target.value)}
                className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00c8ff] focus:border-[#00c8ff] min-w-[180px]">
                <option value="all">All Conferences</option>
                <option value="western">CC Western</option>
                <option value="northern">CC Northern</option>
                <option value="eastern">CC Eastern</option>
                <option value="cape conference">Cape Conference</option>
                <option value="ncsa">NCSA</option>
              </select>
              {/* Count badge */}
              <div className="flex items-center px-4 py-2 rounded-lg bg-[#00c8ff]/10 border border-[#00c8ff]/20 whitespace-nowrap">
                <span className="text-sm font-medium text-[#00c8ff]">{filteredTickets.length} tickets</span>
              </div>
            </div>
          </div>

          {/* Ticket List */}
          <div className="mt-4">
            {loading ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8">
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                      <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
                      <div className="h-4 w-32 bg-white/10 rounded animate-pulse flex-1" />
                      <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 px-5 py-4">
                <p className="font-medium">Error loading tickets</p>
                <p className="text-sm mt-1 text-red-300/70">{error}</p>
              </div>
            ) : isSmallScreen ? (
              <div className="space-y-3">
                {paginatedTickets.map((ticket) => (
                  <div key={ticket.id} className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                      <span className="text-sm font-mono font-medium text-[#00c8ff]">{ticket.id}</span>
                      {renderStatusBadge(ticket.status)}
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-white font-medium text-sm">{ticket.firstName} {ticket.surname}</p>
                        <p className="text-white/40 text-xs mt-0.5">{ticket.email}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">Conference</p><p className="text-xs text-white/70">{ticket.conference}</p></div>
                        <div><p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">Package</p><p className="text-xs text-white/70">{ticket.package}</p></div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => handleShowIDCardPreview(ticket)} className="flex-1 text-center py-2 text-xs font-medium rounded-lg border border-white/10 text-white/60 hover:bg-white/5 transition-colors">ID Card</button>
                        <button onClick={() => openTicketModal(ticket)} className="flex-1 text-center py-2 text-xs font-medium rounded-lg bg-[#00c8ff] text-[#0c0f2e] hover:bg-[#00b4e6] transition-colors">View</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.04] border-b border-white/10">
                      <th className="py-3 pl-5 pr-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Ticket ID</th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Attendee</th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40 hidden lg:table-cell">Conference</th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40 hidden xl:table-cell">Package</th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Status</th>
                      <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-white/40 pr-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTickets.map((ticket, idx) => (
                      <tr key={ticket.id} className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${idx % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
                        <td className="py-3.5 pl-5 pr-3 whitespace-nowrap">
                          <span className="text-sm font-mono font-medium text-[#00c8ff]">{ticket.id}</span>
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <p className="text-sm font-medium text-white">{ticket.firstName} {ticket.surname}</p>
                          <p className="text-xs text-white/35 mt-0.5">{ticket.email}</p>
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap hidden lg:table-cell">
                          <span className="text-sm text-white/60">{ticket.conference}</span>
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap hidden xl:table-cell">
                          <span className="text-xs text-white/50">{ticket.package}</span>
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">{renderStatusBadge(ticket.status)}</td>
                        <td className="px-3 py-3.5 pr-5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleShowIDCardPreview(ticket)} className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors">ID Card</button>
                            <button onClick={() => openTicketModal(ticket)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#00c8ff] text-[#0c0f2e] hover:bg-[#00b4e6] transition-colors">View</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && totalPages > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3">
              <p className="text-sm text-white/40">
                Showing <span className="text-white/70 font-medium">{((safePage - 1) * ITEMS_PER_PAGE) + 1}</span> to <span className="text-white/70 font-medium">{Math.min(safePage * ITEMS_PER_PAGE, filteredTickets.length)}</span> of <span className="text-white/70 font-medium">{filteredTickets.length}</span>
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                  className="px-3 py-1.5 rounded-lg text-sm border border-white/10 text-white/50 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Prev</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) { pageNum = i + 1; }
                  else if (safePage <= 4) { pageNum = i + 1; }
                  else if (safePage >= totalPages - 3) { pageNum = totalPages - 6 + i; }
                  else { pageNum = safePage - 3 + i; }
                  return (
                    <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${safePage === pageNum ? 'bg-[#00c8ff] text-[#0c0f2e]' : 'text-white/50 hover:bg-white/5'}`}>
                      {pageNum}
                    </button>
                  );
                })}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm border border-white/10 text-white/50 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Next</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Ticket Detail Modal */}
      {isModalOpen && selectedTicket && (
        <div
          className="fixed inset-0 overflow-y-auto z-50"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-center min-h-screen p-4 text-center">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-800/60 transition-opacity"
              aria-hidden="true"
            ></div>

            {/* Modal panel */}
            <div className="inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all align-middle max-w-5xl w-full relative">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4 border-b pb-4">
                      <h3
                        className="text-xl leading-6 font-medium text-gray-900"
                        id="modal-title"
                      >
                        {isEditMode ? "Edit Ticket: " : "Ticket Details: "}
                        {selectedTicket.id}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {!isEditMode && (
                          <button
                            onClick={handleEnterEditMode}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>
                        )}
                        {renderStatusBadge(selectedTicket.status)}
                      </div>
                    </div>

                    {editTicketError && (
                      <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">
                          {editTicketError}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        {/* Attendee Information */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Attendee Information
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">
                                First Name
                              </p>
                              {isEditMode ? (
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={editTicketData.firstName || ""}
                                  onChange={(e) =>
                                    handleEditInputChange(
                                      "firstName",
                                      e.target.value
                                    )
                                  }
                                />
                              ) : (
                                <p className="text-sm font-medium">
                                  {selectedTicket.firstName}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Surname</p>
                              {isEditMode ? (
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={editTicketData.surname || ""}
                                  onChange={(e) =>
                                    handleEditInputChange(
                                      "surname",
                                      e.target.value
                                    )
                                  }
                                />
                              ) : (
                                <p className="text-sm font-medium">
                                  {selectedTicket.surname}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Email</p>
                              {isEditMode ? (
                                <input
                                  type="email"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={editTicketData.email || ""}
                                  onChange={(e) =>
                                    handleEditInputChange(
                                      "email",
                                      e.target.value
                                    )
                                  }
                                />
                              ) : (
                                <p className="text-sm">
                                  {selectedTicket.email}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Contact Number
                              </p>
                              {isEditMode ? (
                                <input
                                  type="tel"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={editTicketData.contactNumber || ""}
                                  onChange={(e) =>
                                    handleEditInputChange(
                                      "contactNumber",
                                      e.target.value
                                    )
                                  }
                                />
                              ) : (
                                <p className="text-sm">
                                  {selectedTicket.contactNumber ||
                                    "Not specified"}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Gender</p>
                              {isEditMode ? (
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={editTicketData.gender || ""}
                                  onChange={(e) =>
                                    handleEditInputChange(
                                      "gender",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="">Select gender</option>
                                  <option value="male">Male</option>
                                  <option value="female">Female</option>
                                </select>
                              ) : (
                                <p className="text-sm">
                                  {selectedTicket.gender
                                    ?.charAt(0)
                                    .toUpperCase() +
                                    selectedTicket.gender?.slice(1) ||
                                    "Not specified"}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Age</p>
                              {isEditMode ? (
                                <input
                                  type="number"
                                  min="15"
                                  max="40"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={editTicketData.age || ""}
                                  onChange={(e) =>
                                    handleEditInputChange("age", e.target.value)
                                  }
                                />
                              ) : (
                                <p className="text-sm">
                                  {selectedTicket.age || "Not specified"}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Ticket Details */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Ticket Details
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-500">
                                Conference
                              </p>
                              {isEditMode ? (
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={editTicketData.conference || ""}
                                  onChange={(e) =>
                                    handleEditInputChange(
                                      "conference",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="">Select conference</option>
                                  <option value="cc-western">
                                    Cape Conference - Western Region
                                  </option>
                                  <option value="cc-northern">
                                    Cape Conference - Northern Region
                                  </option>
                                  <option value="cc-eastern">
                                    Cape Conference - Eastern Region
                                  </option>
                                  <option value="cape">
                                    The Cape Conference
                                  </option>
                                  <option value="ncsa">
                                    Northern Conference of South Africa
                                  </option>
                                  <option value="other">
                                    Other
                                  </option>
                                </select>
                              ) : (
                                <p className="text-sm">
                                  {selectedTicket.conference}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Package</p>
                              {isEditMode ? (
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={editTicketData.package || ""}
                                  onChange={(e) =>
                                    handleEditInputChange(
                                      "package",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="">Select package</option>
                                  <option value="basic">Basic — No Pack (R450)</option>
                                  <option value="basicPack">Basic Pack — Jacket (R750)</option>
                                  <option value="halfPack">Half Pack — Jacket & Bag (R950)</option>
                                  <option value="fullPack">Full Pack — Jacket, Bag, Cup & Socks (R1 200)</option>
                                </select>
                              ) : (
                                <p className="text-sm">
                                  {selectedTicket.package}
                                </p>
                              )}
                            </div>
                            {((isEditMode &&
                              PKG_NEEDS_SIZE.includes(editTicketData.package)) ||
                              (!isEditMode &&
                                selectedTicket.hoodieSize)) && (
                              <div>
                                <p className="text-xs text-gray-500">
                                  Jacket Size
                                </p>
                                {isEditMode ? (
                                  <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={editTicketData.hoodieSize || ""}
                                    onChange={(e) =>
                                      handleEditInputChange(
                                        "hoodieSize",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="">Select size</option>
                                    <option value="XS">XS</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                    <option value="XXL">XXL</option>
                                    <option value="XXXL">XXXL</option>
                                  </select>
                                ) : (
                                  <p className="text-sm">
                                    {selectedTicket.hoodieSize}
                                  </p>
                                )}
                              </div>
                            )}
                            {isEditMode && (
                              <div>
                                <p className="text-xs text-gray-500">
                                  Church Insured
                                </p>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={editTicketData.churchInsured || "true"}
                                  onChange={(e) =>
                                    handleEditInputChange(
                                      "churchInsured",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="true">Yes</option>
                                  <option value="false">No</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Documents */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Documents
                          </h4>
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-2">
                                Passport Photo
                              </p>
                              {isEditMode ? (
                                <div className="space-y-2">
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                          handleEditSingleFileUpload(file);
                                        }
                                      }}
                                      className="hidden"
                                      id="edit-passport-photo-upload"
                                    />
                                    <label
                                      htmlFor="edit-passport-photo-upload"
                                      className="cursor-pointer"
                                    >
                                      <div className="text-center">
                                        <svg
                                          className="mx-auto h-12 w-12 text-gray-400"
                                          stroke="currentColor"
                                          fill="none"
                                          viewBox="0 0 48 48"
                                        >
                                          <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                        <div className="mt-2">
                                          <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                            {editUploadedFiles.passportPhoto
                                              ? "Change passport photo"
                                              : "Upload new passport photo"}
                                          </span>
                                          <p className="text-xs text-gray-500 mt-1">
                                            PNG, JPG up to 5MB (optional)
                                          </p>
                                        </div>
                                      </div>
                                    </label>
                                  </div>
                                  {editUploadedFiles.passportPhoto && (
                                    <p className="text-sm text-green-600">
                                      New photo selected:{" "}
                                      {editUploadedFiles.passportPhoto
                                        .originalName ||
                                        editUploadedFiles.passportPhoto
                                          .fileName}
                                    </p>
                                  )}
                                  {isUploadingEditPassportPhoto && (
                                    <div className="flex items-center justify-center p-3 bg-blue-50 rounded-md">
                                      <svg
                                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-600"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                        ></circle>
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                      </svg>
                                      <span className="text-sm text-blue-600">
                                        Uploading passport photo...
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500">
                                      Current:
                                    </span>
                                    <a
                                      href={
                                        selectedTicket.passportPhoto?.replace(
                                          "api/",
                                          ""
                                        ) || "#"
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:text-blue-500"
                                    >
                                      View current photo
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <a
                                  href={
                                    selectedTicket.passportPhoto?.replace(
                                      "api/",
                                      ""
                                    ) || "#"
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#00c8ff] hover:bg-[#00b4e6] text-[#0c0f2e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c8ff]"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                  View Photo
                                </a>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-2">
                                Payment Proof{" "}
                                <span className="text-red-500">
                                  (Cannot be edited)
                                </span>
                              </p>
                              <a
                                href={
                                  selectedTicket.paymentProof?.replace(
                                    "api/",
                                    ""
                                  ) || "#"
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#00c8ff] hover:bg-[#00b4e6] text-[#0c0f2e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c8ff]"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                View Payment
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        {!isEditMode && (
                          <>
                            {/* Status Update */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Update Status
                              </h4>
                              <div className="space-y-4">
                                <div className="relative">
                                  <select
                                    className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c8ff] focus:border-[#00c8ff] sm:text-sm appearance-none bg-white shadow-sm"
                                    value={
                                      pendingStatus || selectedTicket.status
                                    }
                                    onChange={(e) =>
                                      handleStatusChange(
                                        selectedTicket.id,
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="Approved" className="py-2">
                                      Approved
                                    </option>
                                    <option value="Pending" className="py-2">
                                      Pending
                                    </option>
                                    <option value="Declined" className="py-2">
                                      Declined
                                    </option>
                                  </select>
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg
                                      className="h-5 w-5"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                      aria-hidden="true"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                </div>

                                <div>
                                  <label
                                    htmlFor="statusComment"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    Status Change Comment
                                  </label>
                                  <textarea
                                    id="statusComment"
                                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c8ff] focus:border-[#00c8ff]"
                                    rows="2"
                                    placeholder="Enter a comment for this status change..."
                                    value={statusComment}
                                    onChange={(e) =>
                                      setStatusComment(e.target.value)
                                    }
                                  ></textarea>
                                </div>

                                {statusUpdateError && (
                                  <div className="text-sm text-red-600">
                                    {statusUpdateError}
                                  </div>
                                )}

                                <div className="flex items-center space-x-2">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      selectedTicket.status === "Approved"
                                        ? "bg-green-100 text-green-800"
                                        : selectedTicket.status === "Pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    Current Status: {selectedTicket.status}
                                  </span>
                                  {pendingStatus &&
                                    pendingStatus !== selectedTicket.status && (
                                      <span className="text-xs text-gray-500">
                                        → New Status: {pendingStatus}
                                      </span>
                                    )}
                                </div>
                              </div>
                            </div>

                            {/* Status History */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Status History
                              </h4>
                              <div
                                className="overflow-y-auto"
                                style={{ maxHeight: "200px" }}
                              >
                                {selectedTicket.statusComments &&
                                selectedTicket.statusComments.length > 0 ? (
                                  <div className="space-y-2">
                                    {selectedTicket.statusComments.map(
                                      (statusComment, index) => (
                                        <div
                                          key={index}
                                          className="bg-white p-2 rounded border"
                                        >
                                          <div className="flex justify-between items-center">
                                            <span
                                              className={`text-xs font-medium ${
                                                statusComment.status ===
                                                "approved"
                                                  ? "text-green-600"
                                                  : statusComment.status ===
                                                    "pending"
                                                  ? "text-yellow-600"
                                                  : "text-red-600"
                                              }`}
                                            >
                                              {statusComment.status
                                                .charAt(0)
                                                .toUpperCase() +
                                                statusComment.status.slice(1)}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-700 mt-1">
                                            {statusComment.comment}
                                          </p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    No status history available
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Jacket Size Display */}
                            {selectedTicket.hoodieSize && (
                              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                                <h4 className="text-sm font-medium text-[#00c8ff] mb-2">
                                  Pack Details
                                </h4>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-xs text-[#00c8ff]">
                                      Jacket Size
                                    </p>
                                    <p className="text-2xl font-bold text-teal-800">
                                      {selectedTicket.hoodieSize}
                                    </p>
                                  </div>
                                  <div className="bg-teal-100 p-2 rounded-full">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-6 w-6 text-[#00c8ff]"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {isEditMode && (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="text-sm font-medium text-blue-700 mb-2">
                              Edit Mode
                            </h4>
                            <p className="text-xs text-blue-600 mb-4">
                              You are currently editing this ticket. Note:
                              Ticket ID and Payment Proof cannot be changed.
                            </p>
                            <div className="space-y-2">
                              <button
                                onClick={handleEditTicket}
                                disabled={isEditingTicket}
                                className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isEditingTicket ? (
                                  <>
                                    <svg
                                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    Saving...
                                  </>
                                ) : (
                                  "Save Changes"
                                )}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={isEditingTicket}
                                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Cancel Edit
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {!isEditMode && (
                  <button
                    type="button"
                    className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c8ff] sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSaveUpdate}
                    disabled={isSaving || (!pendingStatus && !statusComment)}
                  >
                    {isSaving ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Status Update"
                    )}
                  </button>
                )}
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedTicket(null);
                    setPendingStatus(null);
                    setStatusComment("");
                    setStatusUpdateError(null);
                    setIsEditMode(false);
                    setEditTicketData({});
                    setEditUploadedFiles({ passportPhoto: null });
                    setEditTicketError(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <div
          className="fixed inset-0 overflow-y-auto z-50"
          aria-labelledby="export-modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-center min-h-screen p-4 text-center">
            <div
              className="fixed inset-0 bg-gray-800/60 transition-opacity"
              aria-hidden="true"
              onClick={() => !isExporting && setIsExportModalOpen(false)}
            ></div>

            <div className="inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all align-middle sm:max-w-lg sm:w-full relative">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 sm:mx-0 sm:h-10 sm:w-10">
                    {exportSuccess ? (
                      <svg
                        className="h-6 w-6 text-[#00c8ff]"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-[#00c8ff]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    )}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="export-modal-title"
                    >
                      {exportSuccess ? "Export Successful!" : "Export Data"}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {exportSuccess
                          ? "Your data has been exported successfully."
                          : "Choose a format to export your ticket data."}
                      </p>
                    </div>
                  </div>
                </div>

                {!exportSuccess && (
                  <div className="mt-5 sm:mt-4 space-y-3">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleExport("csv")}
                      disabled={isExporting}
                    >
                      {isExporting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-green-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                          Export as Excel
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    if (!isExporting) {
                      setIsExportModalOpen(false);
                      setExportSuccess(false);
                    }
                  }}
                  disabled={isExporting}
                >
                  {exportSuccess ? "Close" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ID Card Preview Modal */}
      {showIDCardPreviewModal && selectedIDCardTicket && (
        <div
          className="fixed inset-0 overflow-y-auto z-50"
          aria-labelledby="idcard-modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-center min-h-screen p-6">
            <div
              className="fixed inset-0 bg-gray-800/60 transition-opacity"
              aria-hidden="true"
            ></div>
            <div
              className="relative flex flex-col items-center justify-center rounded-xl overflow-hidden shadow-2xl bg-white"
              style={{ maxWidth: "min(420px, 90vw)" }}
            >
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() => setShowIDCardPreviewModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="pt-4 pb-2 px-4 text-center">
                <h3 className="text-sm font-medium text-gray-500">ID Card</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedIDCardTicket.id}</p>
              </div>
              <div className="relative flex justify-center items-center py-4 px-6 overflow-hidden">
                {/* Visible scaled ID card */}
                <div
                  className="flex justify-center items-center"
                  style={{ transform: "scale(0.5)", transformOrigin: "center center" }}
                >
                  <IDCard
                    name={`${selectedIDCardTicket.firstName} ${selectedIDCardTicket.surname}`}
                    id={selectedIDCardTicket.id}
                    conference={selectedIDCardTicket.conference}
                    photoUrl={
                      selectedIDCardPhotoDataUrl ||
                      selectedIDCardTicket.passportPhoto
                    }
                  />
                </div>
                {/* Hidden full-size ID card for download */}
                <div
                  ref={idCardRef}
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    top: 0,
                    width: 738,
                    height: 559,
                    pointerEvents: "none",
                  }}
                >
                  <IDCard
                    name={`${selectedIDCardTicket.firstName} ${selectedIDCardTicket.surname}`}
                    id={selectedIDCardTicket.id}
                    conference={selectedIDCardTicket.conference}
                    photoUrl={
                      selectedIDCardPhotoDataUrl ||
                      selectedIDCardTicket.passportPhoto
                    }
                  />
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-row-reverse gap-3 justify-center">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-lg px-4 py-2 bg-[#00c8ff] text-sm font-medium text-[#0c0f2e] hover:bg-[#00b4e6] focus:outline-none focus:ring-2 focus:ring-[#00c8ff]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleDownloadIDCard}
                  disabled={isIDCardPhotoLoading || isIDCardDownloading}
                >
                  {isIDCardPhotoLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Preparing...
                    </>
                  ) : isIDCardDownloading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    "Download ID Card"
                  )}
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-lg border border-gray-200 px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  onClick={() => setShowIDCardPreviewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Ticket Modal */}
      {isAddTicketModalOpen && (
        <div
          className="fixed inset-0 overflow-y-auto z-50"
          aria-labelledby="add-ticket-modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-center min-h-screen p-4 text-center">
            <div
              className="fixed inset-0 bg-gray-800/60 transition-opacity"
              aria-hidden="true"
              onClick={() =>
                !isCreatingTicket && setIsAddTicketModalOpen(false)
              }
            ></div>

            <div className="inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all align-middle max-w-4xl w-full relative">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4 border-b pb-4">
                      <h3
                        className="text-xl leading-6 font-medium text-gray-900"
                        id="add-ticket-modal-title"
                      >
                        Add New Ticket
                      </h3>
                      <button
                        onClick={() =>
                          !isCreatingTicket && setIsAddTicketModalOpen(false)
                        }
                        className="text-gray-400 hover:text-gray-500"
                        disabled={isCreatingTicket}
                      >
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {createTicketError && (
                      <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">
                          {createTicketError}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column - Personal Information */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900 border-b pb-2">
                          Personal Information
                        </h4>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newTicketData.firstName}
                            onChange={(e) =>
                              handleNewTicketInputChange(
                                "firstName",
                                e.target.value
                              )
                            }
                            placeholder="Enter first name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Surname <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newTicketData.surname}
                            onChange={(e) =>
                              handleNewTicketInputChange(
                                "surname",
                                e.target.value
                              )
                            }
                            placeholder="Enter surname"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newTicketData.email}
                            onChange={(e) =>
                              handleNewTicketInputChange(
                                "email",
                                e.target.value
                              )
                            }
                            placeholder="Enter email address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Number{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newTicketData.contactNumber}
                            onChange={(e) =>
                              handleNewTicketInputChange(
                                "contactNumber",
                                e.target.value
                              )
                            }
                            placeholder="Enter contact number"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Gender <span className="text-red-500">*</span>
                            </label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              value={newTicketData.gender}
                              onChange={(e) =>
                                handleNewTicketInputChange(
                                  "gender",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Age
                            </label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              value={newTicketData.age}
                              onChange={(e) =>
                                handleNewTicketInputChange(
                                  "age",
                                  e.target.value
                                )
                              }
                              placeholder="Enter age"
                              min="1"
                              max="120"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Conference <span className="text-red-500">*</span>
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newTicketData.conference}
                            onChange={(e) =>
                              handleNewTicketInputChange(
                                "conference",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select conference</option>
                            <option value="cc-western">
                              Cape Conference - Western Region
                            </option>
                            <option value="cc-northern">
                              Cape Conference - Northern Region
                            </option>
                            <option value="cc-eastern">
                              Cape Conference - Eastern Region
                            </option>
                            <option value="cape">
                              The Cape Conference
                            </option>
                            <option value="ncsa">
                              Northern Conference of South Africa
                            </option>
                            <option value="other">
                              Other
                            </option>
                            <option value="cape">The Cape Conference</option>
                          </select>
                        </div>
                      </div>

                      {/* Right Column - Package and Documents */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900 border-b pb-2">
                          Package & Documents
                        </h4>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Package <span className="text-red-500">*</span>
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newTicketData.package}
                            onChange={(e) =>
                              handleNewTicketInputChange(
                                "package",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select package</option>
                            <option value="basic">Basic — No Pack (R450)</option>
                            <option value="basicPack">Basic Pack — Jacket (R750)</option>
                            <option value="halfPack">Half Pack — Jacket & Bag (R950)</option>
                            <option value="fullPack">Full Pack — Jacket, Bag, Cup & Socks (R1 200)</option>
                          </select>
                        </div>

                        {PKG_NEEDS_SIZE.includes(newTicketData.package) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Jacket Size{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              value={newTicketData.hoodieSize}
                              onChange={(e) =>
                                handleNewTicketInputChange(
                                  "hoodieSize",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select hoodie size</option>
                              <option value="XS">XS</option>
                              <option value="S">S</option>
                              <option value="M">M</option>
                              <option value="L">L</option>
                              <option value="XL">XL</option>
                              <option value="XXL">XXL</option>
                              <option value="3XL">3XL</option>
                            </select>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Church Insured
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newTicketData.churchInsured}
                            onChange={(e) =>
                              handleNewTicketInputChange(
                                "churchInsured",
                                e.target.value
                              )
                            }
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Initial Status
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newTicketData.status}
                            onChange={(e) =>
                              handleNewTicketInputChange(
                                "status",
                                e.target.value
                              )
                            }
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="declined">Declined</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status Comment
                          </label>
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            rows="3"
                            value={newTicketData.statusComment}
                            onChange={(e) =>
                              handleNewTicketInputChange(
                                "statusComment",
                                e.target.value
                              )
                            }
                            placeholder="Enter initial status comment..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Upload Documents{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Passport Photo Upload Zone */}
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-2">
                                Passport Photo{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <div
                                className={`relative border-2 border-dashed rounded-md p-4 transition-colors ${
                                  uploadedFiles.passportPhoto
                                    ? "border-green-300 bg-green-50"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, "passportPhoto")}
                              >
                                <div className="text-center">
                                  <svg
                                    className="mx-auto h-8 w-8 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                  >
                                    <path
                                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  <div className="mt-2">
                                    <label className="cursor-pointer">
                                      <span className="text-sm font-medium text-green-600 hover:text-green-500">
                                        {uploadedFiles.passportPhoto
                                          ? "Replace photo"
                                          : "Upload photo"}
                                      </span>
                                      <input
                                        type="file"
                                        className="sr-only"
                                        accept="image/*"
                                        onChange={(e) =>
                                          handleSingleFileUpload(
                                            e.target.files[0],
                                            "passportPhoto"
                                          )
                                        }
                                        disabled={isUploadingPassportPhoto}
                                      />
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                      or drag and drop
                                    </p>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    JPG, PNG up to 5MB
                                  </p>

                                  {uploadedFiles.passportPhoto && (
                                    <div className="mt-2 flex items-center justify-center text-sm text-green-600">
                                      <svg
                                        className="h-4 w-4 mr-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      {uploadedFiles.passportPhoto
                                        .originalName ||
                                        uploadedFiles.passportPhoto.fileName}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Payment Proof Upload Zone */}
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-2">
                                Payment Proof{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <div
                                className={`relative border-2 border-dashed rounded-md p-4 transition-colors ${
                                  uploadedFiles.paymentProof
                                    ? "border-green-300 bg-green-50"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, "paymentProof")}
                              >
                                <div className="text-center">
                                  <svg
                                    className="mx-auto h-8 w-8 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                  >
                                    <path
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  <div className="mt-2">
                                    <label className="cursor-pointer">
                                      <span className="text-sm font-medium text-green-600 hover:text-green-500">
                                        {uploadedFiles.paymentProof
                                          ? "Replace document"
                                          : "Upload document"}
                                      </span>
                                      <input
                                        type="file"
                                        className="sr-only"
                                        accept="image/*,.pdf,.doc,.docx"
                                        onChange={(e) =>
                                          handleSingleFileUpload(
                                            e.target.files[0],
                                            "paymentProof"
                                          )
                                        }
                                        disabled={isUploadingPaymentProof}
                                      />
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                      or drag and drop
                                    </p>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    JPG, PNG, PDF up to 5MB
                                  </p>

                                  {uploadedFiles.paymentProof && (
                                    <div className="mt-2 flex items-center justify-center text-sm text-green-600">
                                      <svg
                                        className="h-4 w-4 mr-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      {uploadedFiles.paymentProof
                                        .originalName ||
                                        uploadedFiles.paymentProof.fileName}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Upload Progress Indicator */}
                          {(isUploadingPassportPhoto ||
                            isUploadingPaymentProof) && (
                            <div className="mt-4 flex items-center justify-center p-3 bg-blue-50 rounded-md">
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              <span className="text-sm text-blue-600">
                                Uploading{" "}
                                {isUploadingPassportPhoto
                                  ? "passport photo"
                                  : "payment proof"}
                                ...
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCreateTicket}
                  disabled={isCreatingTicket}
                >
                  {isCreatingTicket ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Ticket...
                    </>
                  ) : (
                    "Create Ticket"
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    if (!isCreatingTicket) {
                      setIsAddTicketModalOpen(false);
                      setCreateTicketError(null);
                      setNewTicketData({
                        firstName: "",
                        surname: "",
                        email: "",
                        contactNumber: "",
                        conference: "",
                        gender: "",
                        age: "",
                        package: "",
                        hoodieSize: "",
                        churchInsured: "true",
                        status: "pending",
                        statusComment: "",
                      });
                      setUploadedFiles({
                        passportPhoto: null,
                        paymentProof: null,
                      });
                    }
                  }}
                  disabled={isCreatingTicket}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default AdminTickets;
