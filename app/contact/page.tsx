"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    program: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#f8f9fb] py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-foreground lg:text-5xl">
              Get in Touch
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {"We're here to answer your questions and guide you through the registration process for upcoming programs."}
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="bg-[#f8f9fb] pb-16 lg:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Left Column - Location & Contact */}
              <div className="space-y-6">
                {/* Campus Location Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">
                        Campus Location
                      </h2>
                      <p className="mt-2 text-muted-foreground">
                        123 Trailblazer Way
                      </p>
                      <p className="text-muted-foreground">Innovation District</p>
                      <p className="text-muted-foreground">Metro City, MC 90210</p>
                    </div>
                  </div>

                  {/* Map placeholder */}
                  <div className="mt-6 h-45 w-full overflow-hidden rounded-xl bg-muted relative">
                    <svg
                      viewBox="0 0 400 200"
                      className="h-full w-full"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect fill="#e5e7eb" width="400" height="200" />
                      {/* Simplified map illustration */}
                      <path
                        d="M0 100 Q100 80 200 100 T400 100"
                        stroke="#d1d5db"
                        strokeWidth="40"
                        fill="none"
                      />
                      <path
                        d="M150 0 L150 200"
                        stroke="#d1d5db"
                        strokeWidth="30"
                        fill="none"
                      />
                      <path
                        d="M250 0 L250 200"
                        stroke="#d1d5db"
                        strokeWidth="20"
                        fill="none"
                      />
                      <circle cx="200" cy="100" r="8" fill="#ea580c" />
                      <path
                        d="M200 70 C200 85 215 100 200 115 C185 100 200 85 200 70"
                        fill="#ea580c"
                      />
                      <circle cx="200" cy="85" r="4" fill="white" />
                    </svg>
                  </div>
                </div>

                {/* Contact Info Cards */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-4 pb-4 border-b border-border">
                    <div className="rounded-full bg-muted p-3">
                      <Phone className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Admissions Office
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        (555) 123-4567
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <div className="rounded-full bg-muted p-3">
                      <Mail className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        General Inquiries
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        hello@trailblazers.edu
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Contact Form */}
              <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-foreground">
                  Quick Inquiry Form
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Fill out the details below and an admissions counselor will reach out within 24 hours.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Full Name
                      </label>
                      <Input
                        type="text"
                        placeholder="Jane Doe"
                        className="mt-2"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        placeholder="(555) 000-0000"
                        className="mt-2"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Exam / Program of Interest
                    </label>
                    <select
                      className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.program}
                      onChange={(e) =>
                        setFormData({ ...formData, program: e.target.value })
                      }
                    >
                      <option value="">Select a program...</option>
                      <option value="jamb">JAMB/UTME Preparation</option>
                      <option value="waec">WAEC Preparation</option>
                      <option value="neco">NECO Preparation</option>
                      <option value="gce">GCE Preparation</option>
                      <option value="counseling">Academic Counseling</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Message (Optional)
                    </label>
                    <textarea
                      className="mt-2 flex min-h-30 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us about your academic goals..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Submit Inquiry
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
