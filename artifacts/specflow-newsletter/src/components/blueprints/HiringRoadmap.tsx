import React from "react";

export interface HiringRoadmapData {
  roles: Array<{
    role: string;
    responsibilities: string;
    salary: string;
    whyFirst: string;
    jobDescription: string;
  }>;
}

export default function HiringRoadmap({ data }: { data: HiringRoadmapData }): React.JSX.Element {
  return (
    <section className="py-12 border-b border-border">
      <h2 className="text-2xl font-serif mb-4">First 3 Hires</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.roles.map((role) => (
          <div key={role.role} className="border border-border rounded-lg p-6 bg-muted/30">
            <h3 className="text-lg font-semibold">{role.role}</h3>
            <p className="text-sm text-muted-foreground mt-1">{role.salary}</p>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Why First</p>
                <p className="text-sm mt-1">{role.whyFirst}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Key Responsibilities</p>
                <p className="text-sm mt-2">{role.responsibilities}</p>
              </div>
            </div>

            <details className="mt-4">
              <summary className="text-xs font-medium cursor-pointer text-blue-600 hover:text-blue-700">
                Read Job Description
              </summary>
              <p className="text-sm mt-3 text-muted-foreground">{role.jobDescription}</p>
            </details>
          </div>
        ))}
      </div>
    </section>
  );
}
