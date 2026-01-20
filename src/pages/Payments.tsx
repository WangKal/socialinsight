import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Download, Plus, Smartphone, Loader2, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCredits, getTransactions } from "@/services/socialEcho";
import { supabase } from '@/intergrations/supabase/client';

export default function Payments() {
  const { toast } = useToast();
  const { user, session, autoSignIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // --- User data ---
  const [credits, setCredits] = useState(0);
  const [usedCredits, setUsedCredits] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // --- Payment states ---
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("custom");
  const [showMpesaDialog, setShowMpesaDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);

  // --- Currency & Credit Rate ---
  const [currency, setCurrency] = useState<"USD" | "KES">("USD");
  const [KES_PER_CREDIT, setKESPerCredit] = useState(10); // default 10

  // --- Constants ---
  const USD_PER_CREDIT = 10; // 1 USD = 10 credits

  const calculateCredits = (amount: string, cur: "USD" | "KES") => {
    const numAmount = parseFloat(amount) || 0;
    if (cur === "USD") return Math.floor(numAmount * USD_PER_CREDIT);
    if (cur === "KES") return Math.floor(numAmount / KES_PER_CREDIT);
    return 0;
  };

  // --- Fetch KES per credit from Supabase ---
  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("setting_value")
        .eq("key", "KES_PER_CREDIT")
        .single();
      if (!error && data?.value) {
        setKESPerCredit(Number(data.value));
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  // --- Fetch user credits & transactions ---
  const fetchPaymentsData = async () => {
    if (!user?.id) {
      navigate("/auth");
      return;
    }

    try {
      setLoadingData(true);
      await fetchSettings(); // fetch KES rate

      const { data: creditsData, error: creditsError } = await getCredits(user.id);
      if (creditsError) throw creditsError;

      const { data: transData, error: transError } = await getTransactions(user.id);
      if (transError) throw transError;

      setCredits(creditsData?.remaining_credits || 0);
      setUsedCredits(creditsData?.used_credits || 0);
      setTransactions(transData || []);
    } catch (err) {
      console.error("Failed to load payments data:", err);
      toast({
        title: "Error",
        description: "Could not load your payment details.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  // --- Auto sign-in / load data ---
  useEffect(() => {
    if (session === null) return;
    if (!user) {
      const token = searchParams.get("jwt");
      if (token) {
        autoSignIn(token).then(({ error }) => {
          if (!error) {
            toast({ title: "Signed in automatically" });
            fetchPaymentsData();
          } else {
            toast({ title: "Auto sign-in failed", description: error?.message || error, variant: "destructive" });
          }
        });
      }
    } else {
      toast({ title: "Welcome Back !" });
      fetchPaymentsData();
    }
  }, [user, searchParams]);

  // --- Payment handling ---
  const initiatePayment = (amount: number) => {
    if (paymentMethod === "mpesa") {
      setPendingAmount(amount);
      setShowMpesaDialog(true);
    } else {
      processPaystackPayment(amount, currency);
    }
  };

  const handleCustomPayment = async () => {
    if (!customAmount || parseFloat(customAmount) <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    initiatePayment(parseFloat(customAmount));
  };

  const handlePackagePayment = async (amount: number) => {
    initiatePayment(amount);
  };

  const processMpesaPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      toast({ title: "Invalid Phone Number", description: "Please enter a valid M-Pesa phone number", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    setShowMpesaDialog(false);
    setTimeout(() => {
      setIsProcessing(false);
      setPhoneNumber("");
      setPendingAmount(null);
      toast({ 
        title: "STK Push Sent", 
        description: `Check your phone (${phoneNumber}) to complete the payment of ${currency === "USD" ? "$" : "KSh"}${pendingAmount}` 
      });
    }, 2000);
  };

  const processPaystackPayment = async (amount: number, cur: "USD" | "KES") => {
    if (!user) {
      toast({ title: "Not logged in", description: "Please log in before making a payment.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("https://socialinsightbackend.onrender.com/api/payments/initiate-paystack-payment/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, amount, currency: cur }),
      });

      const data = await res.json();
      if (!res.ok || !data.authorization_url) throw new Error(data.error || "Could not start payment");

      toast({ title: "Redirecting to Paystack", description: `Processing payment of ${cur === "USD" ? "$" : "KSh"}${amount}.` });
      window.location.href = data.authorization_url;
    } catch (err: any) {
      console.error("Paystack Error:", err);
      toast({ title: "Payment Error", description: err.message || "Failed to initialize payment.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Handle Paystack success redirect ---
  useEffect(() => {
    const reference = searchParams.get("reference");
    const status = searchParams.get("status");

    if (reference && status === "success") {
      toast({ title: "Payment Verified!", description: "Credits updated." });
      fetchPaymentsData();
    }
  }, [searchParams]);

  // --- Render UI ---
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Payments & Credits</h1>

      {/* Credit Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-primary to-accent p-6 rounded-lg shadow-lg text-primary-foreground col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm opacity-90 mb-1">Current Balance</p>
              <p className="text-5xl font-bold">{loadingData ? "..." : credits}</p>
              <p className="text-sm opacity-90 mt-1">Credits Available</p>
            </div>
            <CreditCard className="w-12 h-12 opacity-80" />
          </div>
          <div className="mt-6 pt-4 border-t border-primary-foreground/20">
            <p className="text-sm opacity-90">Usage : {usedCredits}</p>
            <div className="mt-2 bg-primary-foreground/20 rounded-full h-2 overflow-hidden">
              <div className="bg-primary-foreground h-full rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button className="w-full gap-2 h-auto py-4 text-base">
            <Plus className="w-5 h-5" />
            Buy Credits
          </Button>
        </div>
      </div>

      {/* Buy Credits Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Buy Credits</h2>

        {/* Currency Selector */}
        <div className="mb-4">
          <Label>Select Currency</Label>
          <RadioGroup value={currency} onValueChange={(val) => setCurrency(val as "USD" | "KES")}>
            <div className="flex items-center gap-4 mt-2">
              <RadioGroupItem value="USD" id="usd" />
              <Label htmlFor="usd">USD ($)</Label>

              <RadioGroupItem value="KES" id="kes" />
              <Label htmlFor="kes">KES (KSh)</Label>
            </div>
          </RadioGroup>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="custom">Custom Amount</TabsTrigger>
          </TabsList>

          {/* Custom Amount */}
          <TabsContent value="custom">
            <Card className="border-primary/50 shadow-lg">
              <CardHeader>
                <CardTitle className="gradient-text">Choose Your Amount</CardTitle>
                <CardDescription>Enter any amount and see your credit equivalent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ({currency === "USD" ? "$" : "KSh"})</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currency === "USD" ? "$" : "KSh"}</span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="pl-8 text-lg h-12"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {customAmount && parseFloat(customAmount) > 0 && (
                  <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">You will receive:</span>
                      <span className="text-2xl font-bold text-primary">
                        {calculateCredits(customAmount, currency)} Credits
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Rate: {currency === "USD" ? "$1" : `KSh ${KES_PER_CREDIT}`} per credit
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <Label>Select Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-4 border border-border rounded-lg hover:border-primary cursor-pointer transition-colors">
                      <RadioGroupItem value="paystack" id="paystack" />
                      <Label htmlFor="paystack" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Paystack</p>
                          <p className="text-xs text-muted-foreground">Pay with card or bank</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button 
                  className="w-full h-12 text-lg" 
                  onClick={handleCustomPayment}
                  disabled={isProcessing || !customAmount || parseFloat(customAmount) <= 0}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Proceed to Payment</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Transaction History</h2>
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingData
                ? <TableRow><TableCell colSpan={7} className="text-center py-4">Loading...</TableCell></TableRow>
                : transactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.id}</TableCell>
                    <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                    <TableCell>{tx.type}</TableCell>
                    <TableCell>{currency === "USD" ? `$${tx.amount}` : `KSh ${tx.amount}`}</TableCell>
                    <TableCell>{tx.credits} credits</TableCell>
                    <TableCell><Badge variant="secondary">{tx.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* M-Pesa Dialog */}
      <Dialog open={showMpesaDialog} onOpenChange={setShowMpesaDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-success" />
              Enter M-Pesa Number
            </DialogTitle>
            <DialogDescription>
              We'll send an STK push to this number to complete your payment of {currency === "USD" ? `$${pendingAmount}` : `KSh ${pendingAmount}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your number in format: 254XXXXXXXXX
              </p>
            </div>
            <Button 
              className="w-full gap-2" 
              onClick={processMpesaPayment}
              disabled={isProcessing || !phoneNumber}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending STK Push...
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  Send Payment Request
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
