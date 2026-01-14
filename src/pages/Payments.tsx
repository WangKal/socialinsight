import { useState,useEffect, } from "react";

import { useSearchParams,useNavigate  } from "react-router-dom";
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





export default function Payments() {
  const { toast } = useToast();
  const { user, session, autoSignIn } = useAuth();
   const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [credits, setCredits] = useState(0);
  const [usedCredits, setUsedCredits] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Payment states
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("custom");
  const [showMpesaDialog, setShowMpesaDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);

  const CREDIT_RATE = 10;

  const calculateCredits = (amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    return Math.floor(numAmount * CREDIT_RATE);
  };

  // Fetch user's credits and transaction history from backend

  const fetchPaymentsData = async () => {
      if (!user?.id) {
    navigate("/auth")
  }

    try {
      setLoadingData(true);

      // Fetch credits
      const { data: creditsData, error: creditsError } = await getCredits(user.id);
      if (creditsError) throw creditsError;

      // Fetch transactions
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



  // Auto-sign in if not authenticated
  useEffect(() => {
    if (session === null ) return;
    console.log(session.length)
    if (!user) {
      const token = searchParams.get("jwt"); // or internal JWT
      console.log(token)
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

  // --- Payment handling functions ---
  const initiatePayment = (amount: number) => {
    if (paymentMethod === "mpesa") {
      setPendingAmount(amount);
      setShowMpesaDialog(true);
    } else {
      processPaystackPayment(amount);
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
      toast({ title: "STK Push Sent", description: `Check your phone (${phoneNumber}) to complete the M-Pesa payment of $${pendingAmount}` });
    }, 2000);
  };

const processPaystackPayment = async (amount: number) => {
  if (!user) {
    toast({
      title: "Not logged in",
      description: "Please log in before making a payment.",
      variant: "destructive",
    });
    return;
  }

  setIsProcessing(true);

  try {
    // 1. Call Django backend to create Paystack transaction
    const res = await fetch("https://socialinsightbackend.onrender.com/api/payments/initiate-paystack-payment/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        amount: amount,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.authorization_url) {
      throw new Error(data.error || "Could not start payment");
    }

    toast({
      title: "Redirecting to Paystack",
      description: `Processing payment of $${amount}.`,
    });

    // 2. Redirect user to Paystack in same tab
    window.location.href = data.authorization_url;

  } catch (err: any) {
    console.error("Paystack Error:", err);
    toast({
      title: "Payment Error",
      description: err.message || "Failed to initialize payment.",
      variant: "destructive",
    });
  } finally {
    setIsProcessing(false);
  }
};

useEffect(() => {
  const reference = searchParams.get("reference");
  const status = searchParams.get("status");

  if (reference && status === "success") {
    toast({ title: "Payment Verified!", description: "Credits updated." });
    fetchPaymentsData();
  }
}, [searchParams]);


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

      {/* Tabs and Payment UI ... same as your current implementation ... */}

      {/* Buy Credits Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Buy Credits</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="custom">Custom Amount</TabsTrigger>
           {/** <TabsTrigger value="packages">Quick Packages</TabsTrigger>**/}
          </TabsList>

          {/* Custom Amount - Dominant Option */}
          <TabsContent value="custom">
            <Card className="border-primary/50 shadow-lg">
              <CardHeader>
                <CardTitle className="gradient-text">Choose Your Amount</CardTitle>
                <CardDescription>Enter any amount and see your credit equivalent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
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
                        {calculateCredits(customAmount)} Credits
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Rate: $1 = {CREDIT_RATE} credits
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <Label>Select Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  {/**  <div className="flex items-center space-x-2 p-4 border border-border rounded-lg hover:border-primary cursor-pointer transition-colors">
                      <RadioGroupItem value="mpesa" id="mpesa" />
                      <Label htmlFor="mpesa" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Smartphone className="w-5 h-5 text-success" />
                        <div>
                          <p className="font-medium">M-Pesa</p>
                          <p className="text-xs text-muted-foreground">Pay via mobile money</p>
                        </div>
                      </Label>
                    </div>**/}
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
                    <>
                      Proceed to Payment
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credit Packages 
          <TabsContent value="packages">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { credits: 100, price: 10, popular: false },
                { credits: 500, price: 45, popular: true },
                { credits: 1000, price: 85, popular: false },
                { credits: 2500, price: 200, popular: false },
              ].map((pkg, i) => (
                <div
                  key={i}
                  className={`bg-card border rounded-lg p-6 text-center relative ${
                    pkg.popular ? 'border-primary shadow-lg' : 'border-border'
                  }`}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                      Popular
                    </Badge>
                  )}
                  <p className="text-3xl font-bold text-foreground mb-2">{pkg.credits}</p>
                  <p className="text-sm text-muted-foreground mb-4">Credits</p>
                  <p className="text-2xl font-bold text-foreground mb-4">${pkg.price}</p>
                  <Button 
                    className="w-full" 
                    variant={pkg.popular ? "default" : "outline"}
                    onClick={() => handlePackagePayment(pkg.price)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Purchase"
                    )}
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <Label>Select Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {/** <div className="flex items-center space-x-2 p-4 border border-border rounded-lg hover:border-primary cursor-pointer transition-colors">
                 <RadioGroupItem value="mpesa" id="mpesa-pkg" />
                  <Label htmlFor="mpesa-pkg" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Smartphone className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium">M-Pesa</p>
                      <p className="text-xs text-muted-foreground">Pay via mobile money</p>
                    </div>
                  </Label>
                </div>**/}
                {/*<div className="flex items-center space-x-2 p-4 border border-border rounded-lg hover:border-primary cursor-pointer transition-colors">
                  <RadioGroupItem value="paystack" id="paystack-pkg" />
                  <Label htmlFor="paystack-pkg" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Paystack</p>
                      <p className="text-xs text-muted-foreground">Pay with card or bank</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>*/}
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
                    <TableCell>${tx.amount}</TableCell>
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

      {/* M-Pesa Dialog ... same as your current implementation ... */}
            <Dialog open={showMpesaDialog} onOpenChange={setShowMpesaDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-success" />
              Enter M-Pesa Number
            </DialogTitle>
            <DialogDescription>
              We'll send an STK push to this number to complete your payment of ${pendingAmount}
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
