
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function EmailTest() {
  const { session } = useAuth();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("Test Email");
  const [body, setBody] = useState("<h1>Hello!</h1><p>This is a test email from FakUdid App.</p>");
  const [sending, setSending] = useState(false);

  const sendEmail = async () => {
    if (!to) {
      toast.error("Please enter a recipient email address");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: { 
          to, 
          subject, 
          body, 
          from_name: "FakUdid Test" 
        },
      });

      if (error) throw error;
      
      toast.success("Email sent successfully!");
      console.log("Email function response:", data);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(`Failed to send email: ${error.message || "Unknown error"}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Email Sending</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="to" className="text-sm font-medium">To:</label>
            <Input 
              id="to"
              type="email" 
              value={to} 
              onChange={(e) => setTo(e.target.value)} 
              placeholder="recipient@example.com" 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">Subject:</label>
            <Input 
              id="subject"
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              placeholder="Email subject" 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="body" className="text-sm font-medium">Email Body (HTML):</label>
            <Textarea 
              id="body"
              value={body} 
              onChange={(e) => setBody(e.target.value)} 
              rows={6} 
            />
          </div>
          <Button 
            onClick={sendEmail} 
            disabled={sending}
            className="w-full"
          >
            {sending ? "Sending..." : "Send Test Email"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
