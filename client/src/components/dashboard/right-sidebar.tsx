import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatCard } from "./stat-card";
import { PredictionCard } from "./prediction-card";
import { ThreatBadge } from "./threat-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Globe,
  Zap,
  Cloud,
  Wifi,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { StatCard as StatCardType, PredictionMarket, CyberIncident, WeatherAlert } from "@shared/schema";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface RightSidebarProps {
  stats: StatCardType[];
  predictions: PredictionMarket[];
  eventsByRegion: { name: string; value: number; color: string }[];
  threatTrend: { time: string; critical: number; high: number; medium: number }[];
  cyberIncidents?: CyberIncident[];
  weatherAlerts?: WeatherAlert[];
  className?: string;
}

const REGION_COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#06b6d4"];

export function RightSidebar({
  stats,
  predictions,
  eventsByRegion,
  threatTrend,
  cyberIncidents = [],
  weatherAlerts = [],
  className,
}: RightSidebarProps) {
  return (
    <aside
      className={cn(
        "w-[320px] bg-sidebar border-l border-sidebar-border flex flex-col",
        className
      )}
      data-testid="sidebar-right"
    >
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Situation Overview
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {stats.slice(0, 4).map((stat) => (
            <StatCard key={stat.id} stat={stat} className="p-3" />
          ))}
        </div>
      </div>

      <Tabs defaultValue="predictions" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-2 h-8 bg-muted/50">
          <TabsTrigger
            value="predictions"
            className="text-[10px] gap-1 flex-1"
            data-testid="tab-predictions"
          >
            <TrendingUp className="w-3 h-3" />
            Markets
          </TabsTrigger>
          <TabsTrigger
            value="infra"
            className="text-[10px] gap-1 flex-1"
            data-testid="tab-infra"
          >
            <Wifi className="w-3 h-3" />
            Infra
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="text-[10px] gap-1 flex-1"
            data-testid="tab-analytics"
          >
            <BarChart3 className="w-3 h-3" />
            Charts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Prediction Markets
                </h3>
              </div>
              {predictions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs">No prediction markets</p>
                </div>
              ) : (
                predictions.map((prediction) => (
                  <PredictionCard key={prediction.id} prediction={prediction} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="infra" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Cyber & Infrastructure
                  </h3>
                </div>
                {cyberIncidents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <Wifi className="w-6 h-6 mb-2 opacity-50" />
                    <p className="text-xs">No active incidents</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cyberIncidents.map((incident) => (
                      <Card key={incident.id} className="p-3">
                        <div className="flex items-start gap-2 mb-1">
                          <ThreatBadge level={incident.severity} />
                          <Badge variant="outline" className="text-[9px] h-4 bg-purple-500/10 border-purple-500/30">
                            {incident.type.replace("_", " ")}
                          </Badge>
                        </div>
                        <h4 className="text-xs font-medium text-foreground mb-1 line-clamp-1">
                          {incident.title}
                        </h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">
                          {incident.description}
                        </p>
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{incident.percentageAffected}% affected</span>
                          </div>
                          <span className="text-muted-foreground font-mono">
                            {formatDistanceToNow(new Date(incident.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="w-4 h-4 text-blue-500" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Weather Alerts
                  </h3>
                </div>
                {weatherAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <Cloud className="w-6 h-6 mb-2 opacity-50" />
                    <p className="text-xs">No active weather alerts</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {weatherAlerts.map((alert) => (
                      <Card key={alert.id} className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[9px] h-4",
                              alert.severity === "warning" && "bg-red-500/10 border-red-500/30 text-red-500",
                              alert.severity === "watch" && "bg-orange-500/10 border-orange-500/30 text-orange-500",
                              alert.severity === "advisory" && "bg-yellow-500/10 border-yellow-500/30 text-yellow-500",
                              alert.severity === "info" && "bg-blue-500/10 border-blue-500/30 text-blue-500"
                            )}
                          >
                            {alert.type}
                          </Badge>
                          <span className="text-[9px] uppercase text-muted-foreground">{alert.severity}</span>
                        </div>
                        <h4 className="text-xs font-medium text-foreground mb-1 line-clamp-1">
                          {alert.title}
                        </h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">
                          {alert.laymansDescription}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="analytics" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Threat Level Trend (24h)
                  </h3>
                </div>
                <Card className="p-3">
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={threatTrend}>
                        <defs>
                          <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="mediumGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                          axisLine={false}
                          tickLine={false}
                          width={24}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "6px",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="critical"
                          stroke="#ef4444"
                          fill="url(#criticalGrad)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="high"
                          stroke="#f97316"
                          fill="url(#highGrad)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="medium"
                          stroke="#eab308"
                          fill="url(#mediumGrad)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Events by Region
                  </h3>
                </div>
                <Card className="p-3">
                  <div className="flex items-center gap-4">
                    <div className="h-28 w-28">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={eventsByRegion}
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={45}
                            dataKey="value"
                            stroke="none"
                          >
                            {eventsByRegion.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={REGION_COLORS[index % REGION_COLORS.length]}
                              />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {eventsByRegion.map((region, index) => (
                        <div key={region.name} className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: REGION_COLORS[index % REGION_COLORS.length] }}
                          />
                          <span className="text-xs text-foreground flex-1 truncate">
                            {region.name}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {region.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
