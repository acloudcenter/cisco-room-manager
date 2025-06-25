import { Card, CardBody, CardFooter, Button, Image, Spacer, Chip } from "@heroui/react";

import SidebarLayout from "@/layouts/sidebar-layout";

const communityTools = [
  {
    id: "pexip-otj",
    title: "Pexip OTJ Meetings Viewer",
    description: "View and manage One Touch Join meetings for Pexip-enabled rooms",
    image: "/images/tools/pexip-otj.png",
    status: "coming-soon",
  },
  {
    id: "pexip-branding",
    title: "Pexip Branding Creator",
    description: "Create custom branding packages for your Pexip deployment",
    image: "/images/tools/pexip-branding.png",
    status: "coming-soon",
  },
  {
    id: "community-macros",
    title: "Community Macros",
    description: "Browse and install community-contributed macros for Cisco devices",
    image: "/images/tools/community-macros.png",
    status: "coming-soon",
  },
  {
    id: "infinity-assistant",
    title: "Infinity Assistant",
    description: "AI-powered assistant for Pexip Infinity configuration and troubleshooting",
    image: "/images/tools/infinity-assistant.png",
    status: "coming-soon",
  },
  {
    id: "gcp-terraform",
    title: "GCP Terraform Module",
    description: "Deploy Pexip Infinity on Google Cloud Platform with pre-built Terraform modules",
    image: "/images/tools/gcp-terraform.png",
    status: "coming-soon",
  },
  {
    id: "disaster-recovery",
    title: "Disaster Recovery Mode",
    description: "Enable failover and disaster recovery capabilities for Pexip Infinity",
    image: "/images/tools/disaster-recovery.png",
    status: "coming-soon",
  },
  {
    id: "transcription-bot",
    title: "Meeting Transcription Bot",
    description: "Real-time meeting transcription and recording for video conferences",
    image: "/images/tools/transcription-bot.png",
    status: "coming-soon",
  },
  {
    id: "remote-support",
    title: "Zoom/Teams Remote Support",
    description: "Provide remote assistance through Zoom or Teams integration",
    image: "/images/tools/remote-support.png",
    status: "coming-soon",
  },
];

export default function ToolsPage() {
  return (
    <SidebarLayout title="Tools">
      <div className="p-8">
        <div className="backdrop-blur-xl bg-background/30 rounded-2xl border border-divider p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-1">Community Tools</h2>
            <p className="text-sm text-default-500">
              Enhance your Cisco room management experience with community-built tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {communityTools.map((tool) => (
              <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                <CardBody className="px-3 pb-1">
                  <div className="relative">
                    <Image
                      alt={`${tool.title} preview`}
                      className="aspect-video w-full object-cover object-top rounded-lg"
                      fallbackSrc="https://via.placeholder.com/400x225/09090b/71717a?text=Tool+Preview"
                      src={tool.image}
                    />
                    {tool.status === "coming-soon" && (
                      <div className="absolute top-2 right-2 z-10">
                        <Chip color="warning" size="sm" variant="solid">
                          Coming Soon
                        </Chip>
                      </div>
                    )}
                  </div>
                  <Spacer y={2} />
                  <div className="flex flex-col gap-2 px-2">
                    <p className="text-sm font-medium">{tool.title}</p>
                    <p className="text-xs text-default-400 line-clamp-2">{tool.description}</p>
                  </div>
                </CardBody>
                <CardFooter className="justify-end gap-2 pt-2">
                  <Button
                    fullWidth
                    color={tool.status === "available" ? "primary" : "default"}
                    isDisabled={tool.status === "coming-soon"}
                    size="sm"
                    variant={tool.status === "available" ? "solid" : "flat"}
                  >
                    {tool.status === "available" ? "Launch Tool" : "Coming Soon"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
