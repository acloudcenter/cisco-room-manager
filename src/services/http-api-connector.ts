/**
 * HTTP API Connector for Cisco Devices
 *
 * Fallback connection method when WebSocket is not available.
 * Uses the HTTP XML API (getxml/putxml endpoints).
 */

import https from "https";
import { promisify } from "util";

import { parseString } from "xml2js";

const parseXML = promisify(parseString);

export interface DeviceCredentials {
  host: string;
  username: string;
  password: string;
}

export interface DeviceInfo {
  name: string;
  type: string;
  version: string;
  serialNumber: string;
}

export type ConnectionState = "not-connected" | "connecting" | "connected" | "failed";

export class HTTPAPIConnector {
  private credentials: DeviceCredentials | null = null;
  private connectionState: ConnectionState = "not-connected";

  /**
   * Make an HTTPS request to the device
   */
  private async makeRequest(
    path: string,
    method: string = "GET",
    body: string | null = null,
  ): Promise<any> {
    if (!this.credentials) {
      throw new Error("Not connected to device");
    }

    return new Promise((resolve, reject) => {
      const auth = Buffer.from(
        `${this.credentials.username}:${this.credentials.password}`,
      ).toString("base64");

      const options: https.RequestOptions = {
        hostname: this.credentials.host,
        port: 443,
        path: path,
        method: method,
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "text/xml",
        },
        rejectUnauthorized: false, // Accept self-signed certificates
      };

      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve(data);
          } else if (res.statusCode === 401) {
            reject(new Error("Authentication failed - check username and password"));
          } else if (res.statusCode === 302) {
            reject(new Error("Redirect detected - putxml requires authentication"));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      if (body) {
        req.write(body);
      }

      req.end();
    });
  }

  /**
   * Connect to device (validate credentials)
   */
  async connect(credentials: DeviceCredentials): Promise<boolean> {
    this.credentials = credentials;
    this.connectionState = "connecting";

    try {
      // Test connection by getting device status
      const statusXML = await this.makeRequest("/status.xml");
      const parsed = await parseXML(statusXML);

      if (parsed && parsed.Status) {
        this.connectionState = "connected";

        return true;
      } else {
        throw new Error("Invalid response from device");
      }
    } catch (error) {
      this.connectionState = "failed";
      throw error;
    }
  }

  /**
   * Disconnect from device
   */
  disconnect(): void {
    this.credentials = null;
    this.connectionState = "not-connected";
  }

  /**
   * Get device information
   */
  async getDeviceInfo(): Promise<DeviceInfo> {
    const statusXML = await this.makeRequest("/getxml?location=/Status/SystemUnit");
    const parsed = await parseXML(statusXML);

    const systemUnit = parsed?.Status?.SystemUnit?.[0] || {};

    return {
      name: systemUnit.ProductId?.[0] || "Unknown Device",
      type: systemUnit.ProductPlatform?.[0] || "Unknown Type",
      version: systemUnit.Software?.[0]?.Version?.[0] || "Unknown",
      serialNumber: systemUnit.Hardware?.[0]?.Module?.[0]?.SerialNumber?.[0] || "Unknown",
    };
  }

  /**
   * Get a configuration value
   */
  async getConfig(path: string): Promise<any> {
    const xml = await this.makeRequest(`/getxml?location=/Configuration/${path}`);
    const parsed = await parseXML(xml);

    return parsed;
  }

  /**
   * Get a status value
   */
  async getStatus(path: string): Promise<any> {
    const xml = await this.makeRequest(`/getxml?location=/Status/${path}`);
    const parsed = await parseXML(xml);

    return parsed;
  }

  /**
   * Execute a command
   */
  async executeCommand(command: string): Promise<any> {
    const xml = `<Command>${command}</Command>`;
    const response = await this.makeRequest("/putxml", "POST", xml);
    const parsed = await parseXML(response);

    return parsed;
  }

  /**
   * Set a configuration value
   */
  async setConfig(path: string, value: string): Promise<any> {
    const xml = `<Configuration><${path}>${value}</${path}></Configuration>`;
    const response = await this.makeRequest("/putxml", "POST", xml);
    const parsed = await parseXML(response);

    return parsed;
  }

  /**
   * Get connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionState === "connected";
  }
}
