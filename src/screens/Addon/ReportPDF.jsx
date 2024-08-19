import React from "react";
import { Document, Page, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 20 },
  subtitle: { fontSize: 18, marginBottom: 10 },
  text: { fontSize: 12, marginBottom: 5 },
});

const ReportPDF = ({ reportData }) => {
  if (!reportData) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>No report data available</Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{reportData.type} Report</Text>
        {reportData.type === "Monthly Revenue" && (
          <>
            <Text style={styles.subtitle}>Monthly Revenue Breakdown</Text>
            {Object.entries(reportData.data).map(([month, revenue]) => (
              <Text key={month} style={styles.text}>
                Month {parseInt(month) + 1}: ${revenue.toFixed(2)}
              </Text>
            ))}
          </>
        )}
        {reportData.type === "Job Completion Rate" && (
          <>
            <Text style={styles.subtitle}>Job Completion Statistics</Text>
            <Text style={styles.text}>Total Jobs: {reportData.data.total}</Text>
            <Text style={styles.text}>
              Completed Jobs: {reportData.data.completed}
            </Text>
            <Text style={styles.text}>
              Completion Rate: {reportData.data.rate.toFixed(2)}%
            </Text>
          </>
        )}
      </Page>
    </Document>
  );
};

export default ReportPDF;
