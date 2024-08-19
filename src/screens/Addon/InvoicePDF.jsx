import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

// Register a custom font (optional, but adds a professional touch)
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#f9fafb",
    padding: 40,
    fontFamily: "Roboto",
  },
  headerContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottom: "1 solid #e5e7eb",
    paddingBottom: 10,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  headerInfo: {
    fontSize: 10,
    color: "#4b5563",
    marginTop: 4,
  },
  logo: {
    width: 60,
    height: 60,
  },
  section: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#3b82f6",
    borderBottom: "1 solid #e5e7eb",
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    width: "30%",
    fontSize: 12,
    fontWeight: "bold",
    color: "#4b5563",
  },
  value: {
    width: "70%",
    fontSize: 12,
    color: "#1f2937",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: "#9ca3af",
  },
});

const InvoicePDF = ({ job = {}, companyInfo = {} }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.headerContainer}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            {companyInfo.name || "Wegener Asphalt"}
          </Text>
          <Text style={styles.headerInfo}>
            {companyInfo.address || "10200 Quail Run Dr. 63128"}
          </Text>
          <Text style={styles.headerInfo}>
            {companyInfo.phone || "314-300-6562"}
          </Text>
        </View>
        {companyInfo.logoUrl && (
          <Image style={styles.logo} src={companyInfo.logoUrl} />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Invoice Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Job:</Text>
          <Text style={styles.value}>{job.name || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{job.date || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Price:</Text>
          <Text style={styles.value}>${job.price || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{job.address || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{job.email || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{job.phone || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Additional Info:</Text>
          <Text style={styles.value}>{job.info || "N/A"}</Text>
        </View>
      </View>

      <Text style={styles.footer}>Thank you for your business!</Text>
    </Page>
  </Document>
);

export default InvoicePDF;
