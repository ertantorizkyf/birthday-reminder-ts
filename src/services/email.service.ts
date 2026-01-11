import axios, { AxiosError } from 'axios';

interface SendEmailRequest {
  email: string;
  message: string;
}

interface SendEmailResponse {
  status: string;
  sentTime: string;
}

export class EmailService {
  private apiUrl: string;
  private timeout: number;

  constructor() {
    this.apiUrl = process.env.EMAIL_SERVICE_URL || 'https://email-service.digitalenvision.com.au/send-email';
    this.timeout = parseInt(process.env.EMAIL_SERVICE_TIMEOUT || '10000');
  }

  async sendEmail(email: string, message: string): Promise<{ status: string; sentTime: string }> {
    try {
      const response = await axios.post<SendEmailResponse>(
        this.apiUrl,
        {
          email,
          message,
        },
        {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: this.timeout,
        }
      );

      // Check if response is successful
      if (response.status === 200 && response.data.status === 'sent') {
        console.log(`[Email] ✅ Successfully sent email to ${email} at ${response.data.sentTime}`);
        return response.data;
      } else {
        throw new Error(
          `Email service returned unexpected status: ${response.data.status || 'unknown'}`
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response) {
          // Server responded with error status (4xx, 5xx)
          const status = axiosError.response.status;
          const data = axiosError.response.data;
          
          throw new Error(
            `Email service error (${status}): ${JSON.stringify(data)}`
          );
        } else if (axiosError.request) {
          // Request made but no response (network error, timeout)
          if (axiosError.code === 'ECONNABORTED') {
            throw new Error(`Email service timeout after ${this.timeout}ms`);
          }
          throw new Error('Email service unreachable - no response received');
        } else {
          // Request setup error
          throw new Error(`Email service request failed: ${axiosError.message}`);
        }
      }
      
      // Unknown error
      throw new Error(
        `Unexpected error sending email: ${error instanceof Error ? error.message : 'Unknown'}`
      );
    }
  }

  // Test email connectivity
  async testConnection(testEmail: string = 'test@digitalenvision.com.au'): Promise<boolean> {
    try {
      await this.sendEmail(testEmail, 'Test message from birthday reminder service');
      return true;
    } catch (error) {
      console.error('[Email] Connection test failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();