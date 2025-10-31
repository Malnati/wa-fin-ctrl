/**
 * Upload Integration Tests
 * Tests for the enhanced upload functionality with API integration and fallback
 */

import { submitPdf } from "../UploadHelper";

// Mock file for testing
const createMockFile = (name: string, size: number = 1024): File => {
  const content = "a".repeat(size);
  return new File([content], name, { type: "application/pdf" });
};

describe("Upload Integration Tests", () => {
  test("should create proper fallback response", async () => {
    const testFile = createMockFile("test-exam.pdf");
    const params = {
      file: testFile,
      generateAudio: true,
      voiceID: "oi8rgjIfLgJRsQ6rbZh3",
    };

    const result = await submitPdf(params);

    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.json?.status).toContain("SIMULAÇÃO");
    expect(result.json?.resumo).toContain("MODO FALLBACK");
    expect(result.json?.text).toContain("test-exam.pdf");
  });

  test("should handle voice selection correctly", async () => {
    const testFile = createMockFile("voice-test.pdf");

    // Test with feminine voice
    const femaleResult = await submitPdf({
      file: testFile,
      generateAudio: true,
      voiceID: "oi8rgjIfLgJRsQ6rbZh3",
    });
    expect(femaleResult.json?.text).toContain("Feminino");

    // Test without audio
    const noAudioResult = await submitPdf({
      file: testFile,
      generateAudio: false,
      voiceID: "",
    });
    expect(noAudioResult.json?.text).toContain("Não solicitada");
  });

  test("should match API DTO structure", async () => {
    const testFile = createMockFile("dto-test.pdf");
    const result = await submitPdf({
      file: testFile,
      generateAudio: false,
      voiceID: "",
    });

    // Verify required fields from DiagnosticResponseDto
    expect(result.json).toHaveProperty("status");
    expect(result.json).toHaveProperty("resumo");
    expect(result.json).toHaveProperty("text");
    expect(result.json).toHaveProperty("fileUrl");

    // Verify optional fields
    expect(result.json).toHaveProperty("audioUrl");
    expect(result.json).toHaveProperty("pdfUrl");
    expect(result.json).toHaveProperty("pdfSentRaw");
    expect(result.json).toHaveProperty("isScanned");
  });
});
