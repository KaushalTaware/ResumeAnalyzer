import { GoogleGenAI } from "@google/genai"
import { z } from "zod"
import { zodToJsonSchema } from "zod-to-json-schema"
import puppeteer from "puppeteer"


const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const interviewReportSchema = z.object({
     title: z.string().describe(
        "The job title identified from the job description. For example: Node.js Developer, Full Stack Developer, React Developer."
    ),
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    
})

export async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {

    const prompt = `
Generate an interview report based on the following candidate information.

RESUME:
${resume}

SELF DESCRIPTION:
${selfDescription}

JOB DESCRIPTION:
${jobDescription}
IMPORTANT:
Identify the primary job title from the JOB DESCRIPTION.

Return the job title in the "title" field.

For example, if the job description says:
"Join Data Eminence as a remote Node.js Developer..."

then:
"title": "Node.js Developer"

Do NOT use the candidate's desired role from the self description if the job description specifies a different role.

Return ONLY valid JSON.

For technicalQuestions, every item MUST be an object with:
- question
- intention
- answer

For behavioralQuestions, every item MUST be an object with:
- question
- intention
- answer

For skillGaps, every item MUST be an object with:
- skill
- severity

For preparationPlan, every item MUST be an object with:
- day
- focus
- tasks

Do not return arrays of strings.
Do not add fields that are not specified.
and make sure every single question intention and answer is in one object that is part of the array of technicalQuestions or behavioralQuestions.
give a single task in that tasks array  that depends on the focus of that day and is relevant to the preparation plan.
`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,

        config: {
            responseMimeType: "application/json",

            responseJsonSchema: {
                type: "object",

                properties: {
                    title: {
    type: "string",
    description: "The exact job title identified from the job description"
},

                    matchScore: {
                        type: "number",
                        description: "Score between 0 and 100"
                    },

                    technicalQuestions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                question: {
                                    type: "string"
                                },
                                intention: {
                                    type: "string"
                                },
                                answer: {
                                    type: "string"
                                }
                            },
                            required: [
                                "question",
                                "intention",
                                "answer"
                            ]
                        }
                    },

                    behavioralQuestions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                question: {
                                    type: "string"
                                },
                                intention: {
                                    type: "string"
                                },
                                answer: {
                                    type: "string"
                                }
                            },
                            required: [
                                "question",
                                "intention",
                                "answer"
                            ]
                        }
                    },

                    skillGaps: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                skill: {
                                    type: "string"
                                },
                                severity: {
                                    type: "string",
                                    enum: [
                                        "low",
                                        "medium",
                                        "high"
                                    ]
                                }
                            },
                            required: [
                                "skill",
                                "severity"
                            ]
                        }
                    },

                    preparationPlan: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                day: {
                                    type: "number"
                                },
                                focus: {
                                    type: "string"
                                },
                                tasks: {
                                    type: "array",
                                    items: {
                                        type: "string"
                                    }
                                }
                            },
                            required: [
                                "day",
                                "focus",
                                "tasks"
                            ]
                        }
                    }

                },

                required: [
                    "title",
                    "matchScore",
                    "technicalQuestions",
                    "behavioralQuestions",
                    "skillGaps",
                    "preparationPlan"
                ]
            }
        }
    });

   

    const result = JSON.parse(response.text);

    console.log("PARSED AI RESPONSE:");
    console.dir(result, { depth: null });

    return result;
}




async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

export async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `
Generate an interview report based ONLY on the information provided below.

RESUME:
${resume}

SELF DESCRIPTION:
${selfDescription}

JOB DESCRIPTION:
${jobDescription}


`

 const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(resumePdfSchema),
    }
})


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}
