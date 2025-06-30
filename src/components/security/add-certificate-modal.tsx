/**
 * Add Certificate Modal Component
 */

import type { ConnectedDevice } from "@/stores/device-store";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Tabs,
  Tab,
  CircularProgress,
} from "@heroui/react";
import { Icon } from "@iconify/react";

import { addCACertificate } from "@/lib/security";

interface AddCertificateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  device?: ConnectedDevice;
}

export function AddCertificateModal({
  isOpen,
  onOpenChange,
  onSuccess,
  device,
}: AddCertificateModalProps) {
  const [certificateContent, setCertificateContent] = React.useState("");
  const [fileName, setFileName] = React.useState<string>("");
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setCertificateContent("");
    setFileName("");
    setError(null);
  };

  const processFile = (file: File) => {
    if (!file.name.match(/\.(pem|crt|cer|cert)$/i)) {
      setError("Please select a valid certificate file (.pem, .crt, .cer, .cert)");

      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;

      setCertificateContent(content);
      setError(null);
    };

    reader.onerror = () => {
      setError("Failed to read file");
    };

    reader.readAsText(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];

    if (file) processFile(file);
  };

  const handlePaste = (value: string) => {
    setCertificateContent(value);
    setError(null);
  };

  const validateCertificate = (content: string): boolean => {
    const trimmed = content.trim();

    if (!trimmed) {
      setError("Certificate content cannot be empty");

      return false;
    }

    if (
      !trimmed.includes("-----BEGIN CERTIFICATE-----") ||
      !trimmed.includes("-----END CERTIFICATE-----")
    ) {
      setError("Invalid certificate format. Must be in PEM format.");

      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    if (!validateCertificate(certificateContent)) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await addCACertificate(device, certificateContent);
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload certificate");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      onOpenChange(false);
      resetForm();
    }
  };

  return (
    <Modal isOpen={isOpen} size="3xl" onOpenChange={handleClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold">Add CA Certificate</h3>
              <p className="text-xs text-default-500">Upload a certificate in PEM format</p>
            </ModalHeader>
            <ModalBody>
              <Tabs fullWidth aria-label="Upload method" size="sm">
                <Tab key="file" title="Upload File">
                  <div className="space-y-3 py-2">
                    <input
                      ref={fileInputRef}
                      accept=".pem,.crt,.cer,.cert"
                      className="hidden"
                      type="file"
                      onChange={handleFileSelect}
                    />

                    <div
                      className={`
                        border-2 border-dashed rounded-lg p-8 text-center transition-colors
                        ${isDragOver ? "border-primary bg-primary-50" : "border-default-300 bg-default-50"}
                        ${fileName ? "bg-success-50 border-success" : ""}
                      `}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      {fileName ? (
                        <div className="space-y-3">
                          <div className="flex justify-center">
                            <Icon
                              className="text-success"
                              icon="solar:check-circle-bold"
                              width={48}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{fileName}</p>
                            <p className="text-xs text-default-500 mt-1">
                              Certificate ready to upload
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="flat"
                            onPress={() => {
                              setCertificateContent("");
                              setFileName("");
                            }}
                          >
                            Choose Different File
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-center">
                            <Icon
                              className="text-default-300"
                              icon="solar:cloud-upload-outline"
                              width={48}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Drop certificate file here or click to browse
                            </p>
                            <p className="text-xs text-default-500 mt-1">
                              Supports .pem, .crt, .cer, .cert files
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="flat"
                            onPress={() => fileInputRef.current?.click()}
                          >
                            Browse Files
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Tab>

                <Tab key="paste" title="Paste Content">
                  <div className="py-2">
                    <Textarea
                      className="font-mono"
                      label="Certificate Content"
                      maxRows={15}
                      minRows={10}
                      placeholder="-----BEGIN CERTIFICATE-----
MIIDQTCCAimgAwIBAgITBmyfz5m/jAo54vB4ikPmljZbyjANBgkqhkiG9w0BAQsF
...
-----END CERTIFICATE-----"
                      size="sm"
                      value={certificateContent}
                      variant="bordered"
                      onValueChange={handlePaste}
                    />
                  </div>
                </Tab>
              </Tabs>

              {error && (
                <div className="text-danger text-xs p-2 bg-danger-50 rounded mt-2">{error}</div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button isDisabled={isUploading} size="sm" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                isDisabled={!certificateContent || isUploading}
                size="sm"
                onPress={handleUpload}
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <CircularProgress color="current" size="sm" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  "Add Certificate"
                )}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
