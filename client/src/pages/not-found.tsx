import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { NeonButton } from "@/components/NeonButton";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-auto bg-card/50 border-white/10">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold text-white">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Did you take a wrong turn in the word chain?
          </p>

          <div className="mt-8">
             <Link href="/" className="w-full block">
                <NeonButton fullWidth>Back to Home</NeonButton>
             </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
