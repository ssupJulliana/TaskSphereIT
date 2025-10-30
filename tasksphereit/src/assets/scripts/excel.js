// src/utils/excel.js
import ExcelJS from "exceljs";

/**
 * Parse Excel file and extract user data with images
 * @param {File} file - The Excel file to parse
 * @param {string} selectedRole - The default role to assign
 * @returns {Promise<Array>} Array of user objects with data
 */
export const parseExcelFile = async (file, selectedRole) => {
  try {
    const buf = await file.arrayBuffer();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf);
    const ws = wb.worksheets[0];

    if (!ws) {
      throw new Error("No worksheet found in file.");
    }

    // Map images to approximate row (top-left of image)
    const imageByRow = {};
    const imgs = ws.getImages();
    imgs.forEach(({ imageId, range }) => {
      const meta = wb.getImage(imageId);
      if (!meta?.base64) return;
      const tlRow = Math.ceil(range.tl.row || 1);
      const ext = meta.extension || "png";
      const dataUrl = `data:image/${ext};base64,${meta.base64}`;
      if (!imageByRow[tlRow]) imageByRow[tlRow] = dataUrl;
    });

    // Find header row (first non-empty row)
    let headerRowIdx = 1;
    for (let r = 1; r <= ws.actualRowCount; r++) {
      const row = ws.getRow(r);
      const hasAny = row.values.some((v) =>
        typeof v === "string" ? v.trim() : v
      );
      if (hasAny) {
        headerRowIdx = r;
        break;
      }
    }

    const headerRow = ws.getRow(headerRowIdx);
    const headers = {};
    headerRow.eachCell((cell, colNumber) => {
      const key = String(cell.value || "")
        .toLowerCase()
        .trim();
      headers[colNumber] = key;
    });

    // Helper to get column index by header name
    const colIndexOf = (names) => {
      const want = names.map((n) => n.toLowerCase());
      const pair = Object.entries(headers).find(([, v]) => want.includes(v));
      return pair ? Number(pair[0]) : null;
    };

    const colId = colIndexOf(["id number", "student id", "id"]);
    const colLast = colIndexOf(["last name", "lastname", "surname"]);
    const colFirst = colIndexOf(["first name", "firstname", "given name"]);
    const colMid = colIndexOf([
      "middle initial",
      "middle name",
      "middlename",
      "mi",
    ]);
    const colEmail = colIndexOf(["email", "email address"]);
    const colRole = colIndexOf(["role"]);

    if (!colId || !colLast || !colFirst) {
      throw new Error(
        "Missing required headers. Need at least: ID Number, Last Name, First Name."
      );
    }

    const out = [];
    for (let r = headerRowIdx + 1; r <= ws.actualRowCount; r++) {
      const row = ws.getRow(r);
      const idNumber = String(row.getCell(colId).value || "").trim();
      const lastName = String(row.getCell(colLast).value || "").trim();
      const firstName = String(row.getCell(colFirst).value || "").trim();
      const middleName = colMid
        ? String(row.getCell(colMid).value || "").trim()
        : "";
      const email = colEmail
        ? String(row.getCell(colEmail).value || "").trim()
        : "";
      const role = colRole
        ? String(row.getCell(colRole).value || "").trim()
        : selectedRole;

      if (!idNumber && !lastName && !firstName && !email) continue;

      const imageDataUrl = imageByRow[r] || null;

      out.push({
        idNumber,
        lastName,
        firstName,
        middleName,
        email,
        role: role || selectedRole,
        imageDataUrl,
        _select: true,
        _row: r,
      });
    }

    if (out.length === 0) {
      throw new Error("No data rows found.");
    }

    // De-duplicate within file by (idNumber + email)
    const seen = new Set();
    const deduped = out.filter((x) => {
      const key = `${x.idNumber}::${x.email}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return deduped;
  } catch (error) {
    throw new Error(
      error?.message ||
        "Failed to read the Excel file. Ensure it's .xlsx and has headers."
    );
  }
};

/**
 * Validate if file is a valid Excel file
 * @param {File} file - The file to validate
 * @returns {boolean} True if valid Excel file
 */
export const validateExcelFile = (file) => {
  return (
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.name.toLowerCase().endsWith(".xlsx")
  );
};
