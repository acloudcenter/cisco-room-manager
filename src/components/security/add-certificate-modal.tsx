/**
 * Add Certificate Modal Component
 */

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
} from "@heroui/react";
import { Icon } from "@iconify/react";

import { addCACertificate } from "@/lib/security";

interface AddCertificateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddCertificateModal({ isOpen, onOpenChange, onSuccess }: AddCertificateModalProps) {
  const [certificateContent, setCertificateContent] = React.useState("");
  const [fileName, setFileName] = React.useState<string>("");
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setCertificateContent("");
    setFileName("");
    setError(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

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
      await addCACertificate(certificateContent);
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

                    <Button
                      className="w-full"
                      size="sm"
                      startContent={<Icon icon="solar:upload-outline" width={16} />}
                      variant="flat"
                      onPress={() => fileInputRef.current?.click()}
                    >
                      Select Certificate File
                    </Button>

                    {fileName && (
                      <div className="flex items-center gap-2 p-2 bg-default-100 rounded">
                        <Icon icon="solar:file-text-outline" width={16} />
                        <span className="text-xs">{fileName}</span>
                      </div>
                    )}

                    {certificateContent && (
                      <Textarea
                        isReadOnly
                        className="font-mono"
                        label="Certificate Content"
                        maxRows={10}
                        minRows={5}
                        size="sm"
                        value={certificateContent}
                        variant="bordered"
                      />
                    )}
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
                isDisabled={!certificateContent}
                isLoading={isUploading}
                size="sm"
                onPress={handleUpload}
              >
                Add Certificate
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
