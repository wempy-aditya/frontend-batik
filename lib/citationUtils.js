/**
 * DOI Citation Formatter Utility
 * Uses the citation.doi.org API to fetch properly formatted citations
 * API Documentation: https://citation.doi.org
 */

// Available citation styles
export const CITATION_STYLES = {
  apa: {
    id: "apa",
    name: "APA",
    description: "American Psychological Association",
  },
  mla: {
    id: "modern-language-association",
    name: "MLA",
    description: "Modern Language Association",
  },
  chicago: {
    id: "chicago-fullnote-bibliography",
    name: "Chicago",
    description: "Chicago Manual of Style",
  },
  ieee: {
    id: "ieee",
    name: "IEEE",
    description: "Institute of Electrical and Electronics Engineers",
  },
  harvard: {
    id: "harvard-cite-them-right",
    name: "Harvard",
    description: "Harvard Referencing",
  },
  vancouver: {
    id: "vancouver",
    name: "Vancouver",
    description: "Vancouver Style",
  },
  bibtex: { id: "bibtex", name: "BibTeX", description: "BibTeX Format" },
};

// Available languages/locales
export const CITATION_LOCALES = {
  "en-US": "English (US)",
  "en-GB": "English (UK)",
  "id-ID": "Indonesian",
  "de-DE": "German",
  "fr-FR": "French",
  "es-ES": "Spanish",
  "ja-JP": "Japanese",
  "zh-CN": "Chinese (Simplified)",
};

/**
 * Fetch formatted citation from DOI using dx.doi.org content negotiation
 * @param {string} doi - The DOI to render a citation for
 * @param {string} style - The citation style (e.g., 'apa', 'ieee')
 * @param {string} lang - The language/locale (default: 'en-US')
 * @returns {Promise<string>} - Formatted citation string
 */
export async function fetchCitation(doi, style = "apa", lang = "en-US") {
  if (!doi || doi === "N/A") {
    throw new Error("Invalid DOI provided");
  }

  // Clean the DOI (remove https://doi.org/ prefix if present)
  const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, "").trim();

  // Validate DOI format
  if (!isValidDOI(cleanDoi)) {
    throw new Error("Invalid DOI format");
  }

  // Map our style IDs to CSL style IDs for content negotiation
  const styleMap = {
    apa: "apa",
    mla: "modern-language-association",
    chicago: "chicago-fullnote-bibliography",
    ieee: "ieee",
    harvard: "harvard-cite-them-right",
    vancouver: "vancouver",
    bibtex: "bibtex",
  };

  const cslStyle = styleMap[style] || style;

  try {
    // Use dx.doi.org with content negotiation - more reliable than citation.doi.org
    const url = `https://dx.doi.org/${encodeURIComponent(cleanDoi)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept:
          style === "bibtex"
            ? "application/x-bibtex"
            : `text/x-bibliography; style=${cslStyle}; locale=${lang}`,
      },
    });

    if (!response.ok) {
      console.warn(
        `DOI resolution failed with status ${response.status} for DOI: ${cleanDoi}`
      );
      throw new Error(`DOI API returned status ${response.status}`);
    }

    const citation = await response.text();

    // Check if we got valid citation content
    if (!citation || citation.trim().length === 0) {
      throw new Error("Empty citation received from API");
    }

    return citation.trim();
  } catch (error) {
    console.error(`Error fetching citation for DOI ${cleanDoi}:`, error);
    throw error;
  }
}

/**
 * Fetch citation metadata in CSL+JSON format
 * @param {string} doi - The DOI to get metadata for
 * @returns {Promise<object>} - Citation metadata object
 */
export async function fetchCitationMetadata(doi) {
  if (!doi || doi === "N/A") {
    throw new Error("Invalid DOI provided");
  }

  // Clean the DOI
  const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, "").trim();

  // Validate DOI format
  if (!isValidDOI(cleanDoi)) {
    throw new Error("Invalid DOI format");
  }

  try {
    const url = `https://dx.doi.org/${encodeURIComponent(cleanDoi)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/vnd.citationstyles.csl+json",
      },
    });

    if (!response.ok) {
      throw new Error(`Metadata API error: ${response.status}`);
    }

    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error("Error fetching citation metadata:", error);
    throw error;
  }
}

/**
 * Fetch multiple citation formats at once
 * @param {string} doi - The DOI to render citations for
 * @param {string[]} styles - Array of citation styles to fetch
 * @param {string} lang - The language/locale (default: 'en-US')
 * @returns {Promise<object>} - Object with style keys and citation values
 */
export async function fetchMultipleCitations(
  doi,
  styles = ["apa", "mla", "chicago", "ieee", "bibtex"],
  lang = "en-US"
) {
  const results = {};
  const errors = {};

  // Validate DOI first
  if (!doi || doi === "N/A" || !isValidDOI(doi)) {
    console.warn("Invalid DOI provided to fetchMultipleCitations:", doi);
    styles.forEach((style) => {
      results[style] = null;
      errors[style] = "Invalid DOI";
    });
    return { citations: results, errors };
  }

  // Fetch all citations sequentially to avoid rate limiting
  for (const style of styles) {
    try {
      const citation = await fetchCitation(doi, style, lang);
      results[style] = citation;
      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.warn(`Failed to fetch ${style} citation:`, error.message);
      errors[style] = error.message;
      results[style] = null;
    }
  }

  return { citations: results, errors };
}

/**
 * Generate a fallback citation when DOI API is unavailable
 * @param {object} publication - Publication data object
 * @param {string} style - Citation style
 * @returns {string} - Formatted citation string
 */
export function generateFallbackCitation(publication, style = "apa") {
  const {
    authors = [],
    title = "Untitled",
    year = new Date().getFullYear(),
    journal_name,
    venue,
    doi,
    volume,
    issue,
    pages,
  } = publication;

  const journalOrVenue = journal_name || venue || "Unknown Venue";
  const authorList = authors.length > 0 ? authors.join(", ") : "Unknown Author";
  const doiUrl = doi && doi !== "N/A" ? `https://doi.org/${doi}` : "";

  switch (style) {
    case "apa":
      return `${authorList} (${year}). ${title}. ${journalOrVenue}.${
        doiUrl ? ` ${doiUrl}` : ""
      }`;

    case "mla":
      return `${authorList}. "${title}." ${journalOrVenue}, ${year}.${
        doi && doi !== "N/A" ? ` doi:${doi}` : ""
      }`;

    case "chicago":
      return `${authorList}. "${title}." ${journalOrVenue} (${year}).${
        doiUrl ? ` ${doiUrl}` : ""
      }`;

    case "ieee":
      const ieeeAuthors = authors
        .map((author) => {
          const parts = author.trim().split(" ");
          if (parts.length > 1) {
            const lastName = parts[parts.length - 1];
            const initials = parts
              .slice(0, -1)
              .map((n) => n.charAt(0) + ".")
              .join(" ");
            return `${initials} ${lastName}`;
          }
          return author;
        })
        .join(", ");
      return `${ieeeAuthors}, "${title}," ${journalOrVenue}${
        volume ? `, vol. ${volume}` : ""
      }${issue ? `, no. ${issue}` : ""}${
        pages ? `, pp. ${pages}` : ""
      }, ${year}${doi && doi !== "N/A" ? `, doi: ${doi}` : ""}.`;

    case "bibtex":
      const bibKey = `${
        authors[0]?.split(" ")?.pop()?.toLowerCase() || "author"
      }${year}${title.split(" ")[0]?.toLowerCase() || "title"}`;
      return `@article{${bibKey},
  title={${title}},
  author={${authors.join(" and ")}},
  journal={${journalOrVenue}},
  year={${year}},
  ${volume ? `volume={${volume}},\n  ` : ""}${
        issue ? `number={${issue}},\n  ` : ""
      }${pages ? `pages={${pages}},\n  ` : ""}${
        doi && doi !== "N/A" ? `doi={${doi}}` : ""
      }
}`;

    default:
      return `${authorList} (${year}). ${title}. ${journalOrVenue}.`;
  }
}

/**
 * Check if a DOI is valid (basic format validation)
 * @param {string} doi - The DOI to validate
 * @returns {boolean} - True if DOI appears valid
 */
export function isValidDOI(doi) {
  if (!doi || typeof doi !== "string") return false;
  // DOI pattern: starts with 10. followed by registrant code / suffix
  const doiPattern = /^10\.\d{4,}(?:\.\d+)*\/\S+$/;
  const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, "").trim();
  return doiPattern.test(cleanDoi);
}

/**
 * Format DOI as a clickable URL
 * @param {string} doi - The DOI
 * @returns {string} - Full DOI URL
 */
export function formatDOIUrl(doi) {
  if (!doi || doi === "N/A") return "";
  const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, "").trim();
  return `https://doi.org/${cleanDoi}`;
}
