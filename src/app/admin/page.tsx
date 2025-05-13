import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Database, Beaker, Droplet } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Dashboard - AromaChat',
  description: 'AromaChat Essential Oil Management System',
};

const DashboardCard = ({ 
  title, 
  description, 
  icon: Icon, 
  count, 
  href 
}: { 
  title: string; 
  description: string; 
  icon: any; 
  count: number;
  href: string;
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" className="w-full" size="sm">
          <a href={href}>View Details</a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage essential oils and related data for the AromaChat application.
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Essential Oils"
              description="Total essential oils in database"
              icon={Droplet}
              count={18}
              href="/admin/essential-oils"
            />
            <DashboardCard
              title="Chemical Compounds"
              description="Total chemical compounds"
              icon={Beaker}
              count={145}
              href="/admin/chemical-compounds"
            />
            <DashboardCard
              title="Categories"
              description="Essential oil categories"
              icon={Database}
              count={12}
              href="/admin/categories"
            />
            <DashboardCard
              title="Recent Updates"
              description="Updates in last 30 days"
              icon={Clock}
              count={24}
              href="/admin/activity"
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Recent modifications to the essential oils database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <div className="text-sm font-medium">Added Lavender essential oil</div>
                      <div className="ml-auto text-xs text-muted-foreground">Today, 2:30 PM</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <div className="text-sm font-medium">Updated Tea Tree properties</div>
                      <div className="ml-auto text-xs text-muted-foreground">Yesterday, 4:15 PM</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                      <div className="text-sm font-medium">Added 3 new chemical compounds</div>
                      <div className="ml-auto text-xs text-muted-foreground">May 10, 2025</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common management tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/admin/essential-oils/new">
                    <Droplet className="mr-2 h-4 w-4" />
                    Add New Essential Oil
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/admin/categories/new">
                    <Database className="mr-2 h-4 w-4" />
                    Add New Category
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/admin/chemical-compounds/new">
                    <Beaker className="mr-2 h-4 w-4" />
                    Add New Chemical Compound
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Statistics</CardTitle>
              <CardDescription>
                Overview of essential oils database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Essential Oils</div>
                  <div className="text-2xl font-bold">18</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Lookup Items</div>
                  <div className="text-2xl font-bold">247</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Usage Suggestions</div>
                  <div className="text-2xl font-bold">124</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Database Size</div>
                  <div className="text-2xl font-bold">1.2 MB</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
