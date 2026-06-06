"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react"
import { useState } from "react"
import { useForm, ValidationError } from '@formspree/react'

export default function ContactPage() {
  const [state, handleSubmit] = useForm('mdornonj')

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    program: "",
    message: "",
  })
  const [contactData, setContactData] = useState({
    address: "Local Government, 5 Odo Oba Rd, beside Odo-Oba Mosque, Moniya 200132, Oyo",
    phone: "+234 816 599 9425",
    email: "trailblazeredukonsult@gmail.com"
  })

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
                        {contactData.address}
                      </p>
                    </div>
                  </div>

                  {/* Google Maps Integration */}
                  <div className="mt-6 h-60 w-full overflow-hidden rounded-xl bg-muted relative">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.2606507239316!2d3.8921870745982914!3d7.546529292467035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1039f18a4d1a94d3%3A0x663b029ca47d8982!2sTrailblazer%20Academy%20%26%20Edukonsult!5e0!3m2!1sen!2sng!4v1778765788805!5m2!1sen!2sng"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Academy Location"
                    ></iframe>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      className="w-full text-xs cursor-pointer"
                      onClick={() => window.open("https://maps.app.goo.gl/7LV1258gCkycPC1y9", "_blank")}
                    >
                      Visit our location
                    </Button>
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
                        <a href={`tel:${contactData.phone.replace(/\s/g, "")}`}>{contactData.phone}</a>
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
                        <a href={`mailto:${contactData.email}`}>{contactData.email}</a>
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

                {state.succeeded ? (
                  <div className="mt-8 rounded-lg bg-green-50 p-6 text-center border border-green-200">
                    <h3 className="text-lg font-bold text-green-800">Thanks for reaching out!</h3>
                    <p className="mt-2 text-sm text-green-700">We will get back to you as soon as possible.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-foreground">
                          Full Name
                        </label>
                        <Input
                          name="Full Name"
                          type="text"
                          required
                          placeholder="Jane Doe"
                          className="mt-2"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({ ...formData, fullName: e.target.value })
                          }
                        />
                        <ValidationError prefix="Full Name" field="Full Name" errors={state.errors} className="text-sm text-red-500 mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">
                          Phone Number
                        </label>
                        <Input
                          name="Phone Number"
                          type="tel"
                          required
                          placeholder="(555) 000-0000"
                          className="mt-2"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                        />
                        <ValidationError prefix="Phone Number" field="Phone Number" errors={state.errors} className="text-sm text-red-500 mt-1" />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Exam / Program of Interest
                      </label>
                      <select
                        name="Program"
                        required
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
                      <ValidationError prefix="Program" field="Program" errors={state.errors} className="text-sm text-red-500 mt-1" />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Message (Optional)
                      </label>
                      <textarea
                        name="Message"
                        className="mt-2 flex min-h-30 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Tell us about your academic goals..."
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                      />
                      <ValidationError prefix="Message" field="Message" errors={state.errors} className="text-sm text-red-500 mt-1" />
                    </div>

                    <Button
                      type="submit"
                      disabled={state.submitting}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {state.submitting ? "Submitting..." : "Submit Inquiry"}
                      {!state.submitting && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
