import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut, Plus, Key, TrendingUp, MessageSquare, Eye, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ApiKey } from "@shared/schema";

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [isAddKeyModalOpen, setIsAddKeyModalOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: apiKeys = [], isLoading: keysLoading } = useQuery<ApiKey[]>({
    queryKey: ["/api/admin/api-keys"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const addKeyMutation = useMutation({
    mutationFn: async (data: { name: string; key: string }) => {
      const response = await apiRequest("POST", "/api/admin/api-keys", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setIsAddKeyModalOpen(false);
      setKeyName("");
      setKeyValue("");
      toast({
        title: "Success",
        description: "API key added successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add API key. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/api-keys/${id}`, undefined);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "API key deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete API key. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim() || !keyValue.trim()) return;
    addKeyMutation.mutate({ name: keyName, key: keyValue });
  };

  const handleDeleteKey = (id: number) => {
    if (confirm("Are you sure you want to delete this API key?")) {
      deleteKeyMutation.mutate(id);
    }
  };

  return (
    <>
      {/* Admin Header */}
      <div className="bg-background shadow-sm border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome, Admin</span>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="text-red-400 hover:bg-red-950 border-red-700"
            >
              <LogOut size={16} className="mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <ScrollArea className="flex-1 p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <TrendingUp className="text-emerald-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">API Status</p>
                  <p className="text-lg font-bold text-emerald-400">Online</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Key className="text-blue-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-600">Active API Keys</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {statsLoading ? "..." : stats?.totalApiKeys || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-600">Total Tokens Used</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {statsLoading ? "..." : (stats?.totalTokens || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MessageSquare className="text-purple-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-600">Total Requests</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {statsLoading ? "..." : stats?.totalRequests || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Key Management */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>API Key Management</CardTitle>
              <Dialog open={isAddKeyModalOpen} onOpenChange={setIsAddKeyModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus size={16} className="mr-2" />
                    Add New Key
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New API Key</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddKey} className="space-y-4">
                    <div>
                      <Label htmlFor="keyName">API Key Name</Label>
                      <Input
                        id="keyName"
                        value={keyName}
                        onChange={(e) => setKeyName(e.target.value)}
                        placeholder="e.g., Production Key"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="keyValue">API Key</Label>
                      <Input
                        id="keyValue"
                        type="password"
                        value={keyValue}
                        onChange={(e) => setKeyValue(e.target.value)}
                        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="mt-2"
                      />
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsAddKeyModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="flex-1"
                        disabled={addKeyMutation.isPending || !keyName.trim() || !keyValue.trim()}
                      >
                        {addKeyMutation.isPending ? "Adding..." : "Add Key"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          <CardContent>
            {keysLoading ? (
              <div className="text-center py-4">Loading API keys...</div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No API keys found. Add your first key to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-slate-800">{key.key}</span>
                        <Badge variant={key.isActive ? "default" : "secondary"}>
                          {key.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">
                        <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>
                          Last used: {key.lastUsedAt 
                            ? new Date(key.lastUsedAt).toLocaleDateString() 
                            : "Never"}
                        </span>
                        <span className="mx-2">•</span>
                        <span>Tokens: {key.tokensUsed.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteKey(key.id)}
                        disabled={deleteKeyMutation.isPending}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Token Usage Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Token Usage Analytics</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Usage by API Key */}
              <div>
                <h4 className="font-medium text-slate-800 mb-4">Usage by API Key</h4>
                <div className="space-y-3">
                  {stats?.apiKeys?.map((key: any) => {
                    const maxTokens = Math.max(...(stats.apiKeys?.map((k: any) => k.tokensUsed) || [1]));
                    const percentage = maxTokens > 0 ? (key.tokensUsed / maxTokens) * 100 : 0;
                    
                    return (
                      <div key={key.id} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{key.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-800">
                            {key.tokensUsed.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Recent Activity */}
              <div>
                <h4 className="font-medium text-slate-800 mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  {stats?.recentActivity?.slice(0, 3).map((activity: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Chat completion request</span>
                      <div className="text-right">
                        <div className="font-medium text-slate-800">
                          {activity.tokens} tokens
                        </div>
                        <div className="text-slate-500">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-slate-500">
                      No recent activity
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollArea>
    </>
  );
}
