/**
 * VINS FAQ Seed Script
 * Seeds all Vicharanashala internship FAQs as questions + accepted answers.
 *
 * Run: cd server && npx ts-node src/scripts/seed-vins-faqs.ts
 *
 * This script is additive — it does NOT clear existing data.
 * It creates categories only if they don't exist yet.
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { User } from '../models/User';
import { Category } from '../models/Category';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/samagama';

// ─── Category definitions ─────────────────────────────────────────────────────
const VINS_CATEGORIES = [
  {
    name: 'About the Internship',
    slug: 'vins-about',
    description: 'General information about the Vicharanashala internship programme',
    icon: 'info',
    color: '#494bd6',
  },
  {
    name: 'Timing & Dates',
    slug: 'vins-timing',
    description: 'Start dates, duration, cohort windows, and deadlines',
    icon: 'schedule',
    color: '#b52701',
  },
  {
    name: 'NOC & Documentation',
    slug: 'vins-noc',
    description: 'No Objection Certificate process, formats, and submission',
    icon: 'description',
    color: '#ff5c35',
  },
  {
    name: 'Selection & Offer Letter',
    slug: 'vins-selection',
    description: 'How selection works, offer letter, certificate, and dates',
    icon: 'verified',
    color: '#494bd6',
  },
];

// ─── FAQ data ─────────────────────────────────────────────────────────────────
// Each item: { section (→ category slug), question, answer, tags }
const FAQS = [
  // ── Section 1: About the Internship ─────────────────────────────────────────
  {
    section: 'vins-about',
    question: 'What is the Vicharanashala internship (VINS)?',
    tags: ['vins', 'vicharanashala', 'internship', 'iit-ropar'],
    answer: `VINS is the **Vicharanashala Internship** — a two-month, full-time engagement at the Vicharanashala Lab, a research lab at IIT Ropar.

You will work on a **real open-source project** under a mentor, after a short training phase tailored to where you already are.

Key facts:
- **Free** — we do not charge, and the work is real
- **No stipend** — VINS is online and unpaid (VISE is the offline stipend track)
- **Certificate** from Vicharanashala Lab for Education Design, IIT Ropar
- Open to anyone who clears our interview

If you are seeing a **yellow VINS panel** on your result page at samagama.in, you are selected.`,
  },
  {
    section: 'vins-about',
    question: 'What are the phases of VINS, and what do the badges mean?',
    tags: ['vins', 'phases', 'badges', 'bronze', 'silver', 'gold', 'platinum'],
    answer: `VINS is structured as **four phases**, each marked by a badge:

🥉 **Bronze (Phase 1)** — A short training period at the start, planned around what you already know. If you arrive already comfortable with the basics, your mentor may skip Bronze and put you straight on to the project.

🥈 **Silver (Phase 2)** — The main work. You contribute to a real open-source project under a Vicharanashala mentor. **Finishing Bronze + Silver completes your internship and earns the certificate.**

🥇 **Gold (Phase 3)** — A recognition awarded during Silver if your contribution stands on its own as a meaningful feature, not just a small fix.

🏆 **Platinum (Phase 4)** — A standing invitation to visit the lab — a short trip — any time during the year after your internship ends. We help with travel through a small visit stipend.

Most interns finish at Bronze + Silver, and that is exactly what the certificate is for. Gold and Platinum are extras you can earn if your work makes the case for them.`,
  },
  {
    section: 'vins-about',
    question: 'Who is the internship for? Are alumni eligible?',
    tags: ['vins', 'eligibility', 'alumni', 'enrolled', 'students'],
    answer: `The internship is for **currently-enrolled students** at any college or university — undergraduate, postgraduate, or doctoral.

The NOC requirement is the practical reflection of this: we ask for institutional consent that you can commit your time to this internship.

**Alumni are not eligible** for this cycle. Candidates who have already graduated and are not currently enrolled in any programme cannot apply. If you re-enrol later (higher studies, etc.), you are very welcome to apply again in a future cycle.`,
  },
  {
    section: 'vins-about',
    question: 'Is this the same as IIT Ropar\'s official Summer Research Internship?',
    tags: ['vins', 'iit-ropar', 'official', 'summership', 'vled'],
    answer: `**No.** Summership 2026 is a **VLED Lab initiative**. The certificate is issued by the Vicharanashala Lab for Education Design, not centrally by the institute.

IIT Ropar runs a separate institutional summer research internship through its own office.

> ⚠️ Do not represent Summership 2026 as equivalent to IIT Ropar's official institutional programme.`,
  },
  {
    section: 'vins-about',
    question: 'Can I attend my college classes or take leave during the internship?',
    tags: ['vins', 'leave', 'classes', 'full-time', 'attendance'],
    answer: `**No. Leave is not permitted.**

VINS is a full-attention internship — six to ten hours a day, sometimes more.

If you are attending classes or exams during the internship period, you will be **relieved immediately** and will need to join the next batch.

> ❗ Do not attempt to juggle this internship with ongoing college exams. It damages both sides — the project loses momentum, the exams suffer, and your mentor invests in someone who can only half-engage.

If your exams fall inside the cohort duration, **defer your start** to after your exams end and run the internship at full attention.`,
  },

  // ── Section 2: Timing & Dates ────────────────────────────────────────────────
  {
    section: 'vins-timing',
    question: 'When can I start the VINS internship?',
    tags: ['vins', 'start-date', 'cohort', 'timing', 'deadline'],
    answer: `You can start any time in 2026 — VINS is flexible on the start date — but two things must be held in mind:

**Hard rule:** Your internship must finish by **31 December 2026** (non-negotiable). Whatever start you pick, your end date (start + 2 months, with up to 1 month grace) must land on or before 31 December 2026.

**Strong recommendation: start as soon as possible.** Three things make starting earlier materially better:

1. **Cohort networking** — The batch goes through Bronze together. Peer discussions, parallel problem-solving, and lasting connections happen during the May–July window. Later starters are largely solo.
2. **TA support is concentrated in May–July** — After this window, TAs return to their own college work and bandwidth is materially thinner.
3. **Training rolls out with the cohort**, not piecemeal — you get the material with the discussion around it.

If starting now is genuinely impossible (exams, unavoidable commitments), you can begin later and still earn the certificate — but be honest with yourself about the trade-offs.`,
  },
  {
    section: 'vins-timing',
    question: 'How long is the VINS internship?',
    tags: ['vins', 'duration', 'grace-period', 'two-months'],
    answer: `**Two months** from your chosen start date, with an **optional one-month grace period** if you need it.

Your end date must land on or before **31 December 2026**.`,
  },
  {
    section: 'vins-timing',
    question: 'Can I start in July, August, or later if I have exams now?',
    tags: ['vins', 'exams', 'delay', 'start-date'],
    answer: `**Yes — but only if your exams genuinely make an earlier start impossible.**

Wait until your exams are done, then opt in and start. Do **not** attempt to juggle this internship with ongoing exams.

Make sure your chosen start date plus 2 months (or 3 with grace) lands on or before **31 December 2026**.`,
  },
  {
    section: 'vins-timing',
    question: 'Can I start with the cohort and take a break during my exam window?',
    tags: ['vins', 'exams', 'break', 'relaxation', 'leave'],
    answer: `**No. This arrangement is not offered.**

VINS is a full-attention internship. Splitting it with college exams damages both sides.

> ⚠️ If we later learn that a candidate was sitting college exams during their internship period, we reserve the right to terminate the internship or withhold the certificate at any time — including after the internship has otherwise been completed.

**The right path:** Defer your start to after your exams end, opt in then, and run the internship at full attention. The certificate and project pathway are the same.`,
  },
  {
    section: 'vins-timing',
    question: 'Are orientation session recordings shared with interns who join late?',
    tags: ['vins', 'orientation', 'recordings', 'late-joiners'],
    answer: `**Recordings of the sessions will not be provided.**

We may provide access to an abridged version of a talk or session if we consider it important, but we do not guarantee this for every session.

If you joined late, you are expected to complete the orientation through a **special proctored catch-up path on ViBe**. The catch-up is entirely proctored and includes quizzes that check whether you have understood the orientation content. Completing this catch-up is **mandatory** for late starters before participating in the regular standups.`,
  },

  // ── Section 3: NOC ───────────────────────────────────────────────────────────
  {
    section: 'vins-noc',
    question: 'What dates do I put on the NOC?',
    tags: ['noc', 'dates', 'start-date', 'end-date'],
    answer: `Use:
- **Start date:** Your chosen start date (pick the earliest you can realistically make — the May–July summer window is the main cohort)
- **End date:** Start + 2 months (with up to 1 month grace), ensuring the end date is on or before **31 December 2026**

If the NOC will be signed on a specific later date, pick a **start date after the signature date**.`,
  },
  {
    section: 'vins-noc',
    question: 'Who can sign my NOC?',
    tags: ['noc', 'signatory', 'hod', 'principal', 'dean'],
    answer: `Any **authorised signatory** at your college:

- HOD or Acting HOD (during holidays)
- Principal
- Dean or Director
- Training & Placement Officer

**Special cases:**
- **Dual-degree students:** Either institution can sign — pick whichever is easier
- **IITM BS Online Degree (standalone) students:** Any officer from the BS office can sign`,
  },
  {
    section: 'vins-noc',
    question: 'When do I submit the NOC? Is there a hard deadline?',
    tags: ['noc', 'deadline', 'submission', 'start-date'],
    answer: `There is **no specific calendar cut-off date** by which the NOC must be uploaded — but your internship **cannot formally begin until your official institutional NOC has been uploaded and validated** by us.

Submit your signed NOC as **early as possible** to join the current summer cohort.

> ⚠️ The earlier self-declaration / provisional-offer path was retired on 2026-05-27. A signed institutional NOC is now the only way forward.`,
  },
  {
    section: 'vins-noc',
    question: 'What format should I use for the NOC? Do I need to design it myself?',
    tags: ['noc', 'format', 'download', 'template', 'samagama'],
    answer: `**No — we provide a printable NOC format.**

Once your result is out:
1. Log in to **samagama.in**
2. Click **"Download blank NOC"** on your dashboard
3. Take a printout, get it physically signed and stamped by your authorised signatory
4. Scan it
5. Upload the signed PDF using the **"Upload signed NOC"** button on the dashboard

You do not need to draft anything yourself, and you do not need college letterhead — the format we provide is the canonical layout.`,
  },
  {
    section: 'vins-noc',
    question: 'What if my college gives me an NOC in their own format?',
    tags: ['noc', 'college-format', 'custom-format', 'requirements'],
    answer: `A college's own NOC format is acceptable, as long as it includes all required entries:

✅ **Handwritten signature** of the signing authority (most important)
✅ Signing authority's **name, designation, official email, and phone number** (we cross-check to verify)
✅ Your **full name and the internship period** (start and end dates)
✅ **Your signature**

If your college's format does not include a place for your signature, **sign clearly anywhere on the document** before uploading.

With these entries present, you do not need to switch to our printable format. An NOC missing any of them is incomplete and will be returned for correction.`,
  },
  {
    section: 'vins-noc',
    question: 'Does the NOC need to be signed by hand? Are digital signatures accepted?',
    tags: ['noc', 'signature', 'digital', 'handwritten', 'rubber-stamp'],
    answer: `**Yes, handwritten signature is required.** Three things are needed:

1. The authorised signatory's **handwritten signature**
2. The institutional **rubber stamp / seal** applied in the designated area
3. The signatory's **email address** filled in — we automatically cross-check to verify the signature is genuine

**Digital signatures are not accepted** on the PDF path.

If a physically-signed printout is impractical for your HOD, you must still upload the NOC yourself from your dashboard — the email-forward path (where HOD emails us directly) has been **retired**.`,
  },
  {
    section: 'vins-noc',
    question: 'Can my HOD email the NOC to you instead of me uploading it?',
    tags: ['noc', 'email', 'upload', 'hod', 'dashboard'],
    answer: `**No.**

Your NOC must be **uploaded by you, the student**, from your dashboard at samagama.in.

> The email-forward path where your HOD emailed the NOC to us has been retired. NOCs emailed to us — whether by you or by your HOD — **will not be processed**.

**The only accepted way:** Download the format → get it signed → upload the signed PDF yourself from your dashboard.`,
  },
  {
    section: 'vins-noc',
    question: 'How do I download and upload the NOC on samagama.in?',
    tags: ['noc', 'download', 'upload', 'dashboard', 'samagama'],
    answer: `Both happen on your dashboard at **samagama.in** once your result is out.

You'll find the NOC section in three places (all backed by the same endpoints):
1. A compact pill in the **dark header bar** at the top of every screen
2. A **standalone NOC card** on the dashboard (between Results card and Talk-to-Yaksha)
3. A **NOC section at the bottom** of your full Result message

**The two buttons:**
- **"Download blank NOC"** — saves the printable NOC format PDF
- **"Upload signed NOC (PDF)"** — opens a file picker; file must be a PDF of at most **1 MB**

> If you can't see the buttons, make sure you are logged in as the email that received the result, and that your result has been released.`,
  },
  {
    section: 'vins-noc',
    question: 'What if my NOC is not formally verified yet?',
    tags: ['noc', 'verification', 'offer-letter', 'timeline'],
    answer: `NOC verification typically takes **anywhere between an hour and one full working day** from the moment you upload.

Your offer letter is issued automatically once your signed institutional NOC is uploaded and validated.

> ⚠️ The earlier self-declaration / provisional-offer option was retired on 2026-05-27 and is no longer accepted.

Please upload your signed NOC as early as you can so your start is not delayed.`,
  },
  {
    section: 'vins-noc',
    question: 'My online course (Masai, NPTEL, Coursera, etc.) won\'t issue an NOC. What do I do?',
    tags: ['noc', 'online-course', 'masai', 'nptel', 'eligibility'],
    answer: `The internship is open **only to candidates currently enrolled in a full-time degree programme** at a recognised college or university.

Online-only courses (Masai Institute, NPTEL/MOOC enrolments, Coursera, Udacity, bootcamps, etc.) **do not by themselves make a candidate eligible**.

**If you are concurrently enrolled** in a full-time degree programme alongside the online course: obtain a No Due / No Objection certificate from that college and upload it via the dashboard.

**If your only current academic engagement is the online course** and you are not concurrently enrolled in a full-time degree programme: the internship is not open to you in this cycle. We would warmly welcome you to apply again in a future cycle once you are enrolled in a full-time programme.`,
  },
  {
    section: 'vins-noc',
    question: 'My HOD wants written confirmation before signing the NOC. What do I show them?',
    tags: ['noc', 'confirmation', 'hod', 'proof-of-selection', 'dashboard'],
    answer: `Your selection is **already confirmed** the moment your yellow VINS result panel appears on your samagama.in dashboard — that is the official confirmation of your selection, and it is what your HOD should sign your NOC on the basis of.

> There is no separate written confirmation letter or proof-of-selection document issued before the NOC step — and none can be sent on request.

The selection-confirmation letter and self-declaration / provisional-offer route have both been discontinued. Your offer letter is issued **only after** your signed NOC is uploaded and validated.

**Show your HOD the VINS result panel** on the dashboard as evidence of selection — that is the confirmation we provide.`,
  },
  {
    section: 'vins-noc',
    question: 'Can Prof. Sudarshan Iyengar or an IIT Ropar faculty member sign my NOC?',
    tags: ['noc', 'sudarshan', 'iit-ropar', 'faculty', 'signatory'],
    answer: `**No.**

Your NOC must be signed by an **authorised signatory at the institution where you are enrolled as a student** — such as your HOD, Dean, Principal, or Training & Placement Officer.

Prof. Sudarshan Iyengar is a faculty member at IIT Ropar and is not the authorised signatory for the IIT Ropar/Masai online AIML programme. He cannot sign your NOC in a personal capacity.

**Regarding eligibility:** An online-only certification course (even if offered jointly with an IIT) does not meet the full-time enrolment requirement on its own.

If you are concurrently enrolled in a full-time degree programme elsewhere, obtain the NOC from the authorised signatory at that institution. If your only current enrolment is an online programme, you are not eligible for this cycle.`,
  },

  // ── Section 4: Selection & Offer Letter ─────────────────────────────────────
  {
    section: 'vins-selection',
    question: 'How do I know if I am selected for VINS?',
    tags: ['vins', 'selection', 'samagama', 'result'],
    answer: `If you can see your **yellow VINS result panel** on samagama.in, you are selected.

There is no separate selection step or confirmation email.`,
  },
  {
    section: 'vins-selection',
    question: 'How do I opt into VINS?',
    tags: ['vins', 'opt-in', 'yaksha', 'accept'],
    answer: `Tell **Yaksha** in the chat:

> *"I want to take up the online internship without stipend."*

Yaksha will confirm. Opting in is the selection — no separate confirmation email is sent at that stage.`,
  },
  {
    section: 'vins-selection',
    question: 'When do I get the offer letter?',
    tags: ['vins', 'offer-letter', 'noc', 'dashboard', 'samagama'],
    answer: `Your offer letter is issued **automatically** once:
1. You upload your signed institutional NOC, **AND**
2. You have confirmed your start and end dates on the dashboard (§4.5), **AND**
3. We validate the NOC — typically within **an hour to one full working day** of upload

The offer letter lives on your **dashboard at samagama.in**, not in your email. When issued, a notification appears in the **Announcements section**. Log in and click **"Download Offer Letter"** from the Offer Letter card.

> ⚠️ The earlier self-declaration / provisional-offer "fast path" was retired on 2026-05-27. A signed institutional NOC is now the only way the offer letter is issued.`,
  },
  {
    section: 'vins-selection',
    question: 'Will I get a certificate at the end of VINS?',
    tags: ['vins', 'certificate', 'completion', 'vicharanashala'],
    answer: `**Yes** — every intern who completes the internship gets a **certificate from Vicharanashala, IIT Ropar**.

The internship is genuinely demanding. Candidates who drop out mid-way do not get a certificate. Finishing means something, because the bar is high.`,
  },
  {
    section: 'vins-selection',
    question: 'How do I confirm my internship dates on the dashboard?',
    tags: ['vins', 'dates', 'dashboard', 'samagama', 'confirm'],
    answer: `1. Opt into VINS in the Yaksha chat (see above)
2. Log in to **samagama.in**
3. Find the yellow card titled **"🗓️ Confirm your internship dates"**
4. The two date pickers pre-fill with sensible defaults for the current cohort
5. If those work for you, hit **"Save dates"** — otherwise edit to your earliest realistic start
6. Your end must be on or before **31 December 2026**

A green confirmation appears once saved. You can edit any time from the same card.

> Order doesn't matter — you can save dates before or after uploading your NOC. The dates you enter must match the period your HOD signed off on in your NOC.`,
  },
  {
    section: 'vins-selection',
    question: 'How do I accept the offer letter?',
    tags: ['vins', 'offer-letter', 'acceptance', 'reply', 'format'],
    answer: `Accepting the offer letter has a **precise form** — the form itself is the first attention-to-detail check of the internship.

**Reply All** on the offer-letter email thread. In the body, paste **exactly**:

> *I, [Full Name], confirm that I have read, understood, and accepted all terms, conditions, and obligations set out in this offer letter and in the program FAQ at samagama.in. I formally accept the offer of Summer Internship 2026.*

Rules:
- Copy-paste **as-is** — do not paraphrase, shorten, or rearrange the words
- Add your **date** to the reply
- The reply must reach us within **5 days** of the offer letter being sent

**Alternative:** Download the offer letter PDF, fill in your name and date in the acceptance block, sign and scan as a PDF, and attach the signed file to your reply.`,
  },
  {
    section: 'vins-selection',
    question: 'What happens if I reply to the offer letter with the wrong acceptance format?',
    tags: ['vins', 'offer-letter', 'withdrawal', 'acceptance', 'format'],
    answer: `**The offer is withdrawn immediately, with no further correspondence.**

This is a deliberate policy. The acceptance statement is the first attention-to-detail check — every commit, every report, every patch during the internship is expected to match a stated specification.

**Non-compliant examples:**
- "I happily accept" / "I gladly confirm" (paraphrase)
- Bare "I accept" or "Yes, accepted"
- Missing the date
- Missing the FAQ-reference clause
- Attached photo/scan of an unfilled or undated offer letter

**One-word leniency (not counted as non-compliant):**
- Single-word slips ("the offer letter" vs. "this offer letter")
- Obvious typing mistakes in an otherwise complete attestation

If you received a withdrawal email and believe it was a genuine error, you may appeal — see the next question.`,
  },
  {
    section: 'vins-selection',
    question: 'I received an offer letter withdrawal email. Can it be reversed?',
    tags: ['vins', 'offer-letter', 'withdrawal', 'appeal', 'reconsider'],
    answer: `There is an **appeal path**, with conditions.

**Do not** reply to the withdrawal email — replies are not read.

To appeal, send a **fresh email** to: \`sudarshansudarshan@gmail.com\`

The subject line must be **exactly**:
> *Request to Reconsider: Confirmation Reply Error*

Copy-paste this subject line as-is. Our AI engine routes appeals by matching this exact title — any typo, extra word, missing colon, or capitalisation change will cause the appeal to be missed.

In the body, state an **apology** for the mistake and the reason. If genuine, we will respond within 24 hours.

**If granted:** You are placed on a separate track that includes a short course on attention to detail, which you must complete and clear before the internship can proceed.`,
  },
  {
    section: 'vins-selection',
    question: 'My dashboard didn\'t update after I sent my acceptance email. Is that normal?',
    tags: ['vins', 'offer-letter', 'dashboard', 'acceptance', 'status'],
    answer: `**Yes, this is normal and expected.**

The dashboard tracks your NOC, internship dates, and offer letter — it **does not track the acceptance email**.

We process acceptance emails manually. If your reply was compliant with the format in §4.7, no further action is needed — you are accepted and the internship will proceed on the agreed dates.

If your reply was non-compliant, you will receive a withdrawal email.

If several working days pass and you have heard nothing, log in to samagama.in and type **#escalate** in the Yaksha chat.`,
  },
  {
    section: 'vins-selection',
    question: 'Can I change my internship dates after the offer letter is issued?',
    tags: ['vins', 'dates', 'change', 'offer-letter', 'final'],
    answer: `**Before** the offer letter is issued: Yes — open the "Confirm Internship Dates" card on your dashboard and edit any time. Your end date must be on or before 31 December 2026.

**After** the offer letter is issued: **No.** Dates are final and will not be changed.

If the confirmed dates do not work for you, please follow our LinkedIn page for announcements about future cohorts: [linkedin.com/company/vicharanashala](https://linkedin.com/company/vicharanashala)`,
  },
  {
    section: 'vins-selection',
    question: 'How and when do I get the Zoom link for the kickoff meeting?',
    tags: ['vins', 'zoom', 'kickoff', 'orientation', 'link'],
    answer: `The kickoff orientation is held for the **main summer cohort only** (candidates starting in the May–July window).

The Zoom link is delivered through two channels:
1. **Email** to your registered samagama.in address
2. Your **Yaksha chat portal** — log in to samagama.in, open the chat, and the link is shown there

If your start date is later (mid-summer or beyond), there is no separate kickoff event for you.

If you cannot register with the Zoom link or have not received it, log in to samagama.in and type **#escalate** in the Yaksha chat.`,
  },
  {
    section: 'vins-selection',
    question: 'My NOC is not ready but my start date is approaching. What do I do?',
    tags: ['vins', 'noc', 'start-date', 'delay'],
    answer: `Get your signed institutional NOC uploaded as soon as you can.

Your start date **cannot be honoured** until your official NOC is uploaded and validated by us. If your NOC is not in by your chosen start date, your start simply shifts to whenever it is validated.

> ⚠️ The earlier self-declaration / provisional-offer option was retired on 2026-05-27 and is no longer accepted. A signed institutional NOC is the only way forward.`,
  },
  {
    section: 'vins-selection',
    question: 'When does my internship actually begin? Will I get a notification?',
    tags: ['vins', 'start-date', 'day-1', 'bronze', 'notification'],
    answer: `Your internship begins on the **start date you confirmed on the dashboard** — the same date printed on your offer letter — provided your official institutional NOC has been uploaded and validated by then.

There is **no separate "your internship has begun" notification** on the day itself.

**On the morning of your start date:**
1. Log in to samagama.in
2. Yaksha will guide you through the Day-1 steps of the Bronze phase

If your dashboard appears unchanged, do a hard refresh and re-login. If it still looks the same, type **#escalate** in the chat.`,
  },
  {
    section: 'vins-selection',
    question: 'Can I switch from VINS (online) to VISE (offline) after being selected?',
    tags: ['vins', 'vise', 'switch', 'offline', 'online'],
    answer: `**No.** The two tracks are finalised at the interview stage. We do not move candidates between them.

VISE has a fixed on-campus capacity planned around mentor bandwidth, hostel availability, and stipend allocation — once the shortlist is set, it stays set.

**VINS is not a consolation track.** The project, the mentor, and the certificate are the same as VISE — what differs is the mode (online) and the absence of a fellowship.

Your best path forward is to confirm your VINS start dates and get your NOC uploaded — you're already in a strong position.`,
  },
  {
    section: 'vins-selection',
    question: 'How do I get the link for the daily Zoom standups? Are they mandatory?',
    tags: ['vins', 'standup', 'zoom', 'mandatory', 'attendance'],
    answer: `Daily Zoom standup links are posted in the **Announcements section** on your samagama.in dashboard — look for the announcement bell at the top of the page. **Check it daily before the session.**

We do not send separate emails for daily standups.

**Attending daily standups is mandatory** for all interns. Missing standups is treated as missing work. Attendance and participation are tracked against strict thresholds.`,
  },
  {
    section: 'vins-selection',
    question: 'How do I provide my Zoom ID, and why does it matter?',
    tags: ['vins', 'zoom-id', 'attendance', 'dashboard'],
    answer: `On your dashboard, just before "Start the internship," you'll see a step called **"Provide your Zoom ID."**

Enter the **exact email address linked to your Zoom account** — the one you use (or will use) to join the daily live sessions — and save it.

> This matters because we match your live-session attendance and participation using this email. If the Zoom ID you provide doesn't match the email you actually join Zoom with, **your attendance won't be credited to you**.

Enter it carefully and be sure it is genuinely your Zoom account's email.

Once saved, your Zoom ID is **final and cannot be changed by you**. If you entered the wrong email, type **#escalate** in the chat with your correct Zoom email and our team will review it.`,
  },
];

// ─── Main seed function ───────────────────────────────────────────────────────
const seed = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Get or create the admin user
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.error('❌ No admin user found. Run the main seed script first: npm run seed');
    process.exit(1);
  }
  console.log(`👤 Using admin: ${admin.username}`);

  // Ensure categories exist
  console.log('\n📂 Setting up VINS categories...');
  const catMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const catData of VINS_CATEGORIES) {
    let cat = await Category.findOne({ slug: catData.slug });
    if (!cat) {
      cat = await Category.create(catData);
      console.log(`   ✅ Created category: ${catData.name}`);
    } else {
      console.log(`   ⏩ Category exists: ${catData.name}`);
    }
    catMap[catData.slug] = cat._id as mongoose.Types.ObjectId;
  }

  // Remove existing VINS questions to avoid duplication (idempotent)
  const vinsSlugsList = VINS_CATEGORIES.map((c) => c.slug);
  const vinsCatIds = vinsSlugsList.map((s) => catMap[s]);
  const deleted = await Question.deleteMany({ category: { $in: vinsCatIds } });
  if (deleted.deletedCount > 0) {
    console.log(`\n🗑️  Removed ${deleted.deletedCount} existing VINS questions (re-seeding)`);
  }

  // Reset category counts
  for (const id of vinsCatIds) {
    await Category.findByIdAndUpdate(id, { questionCount: 0 });
  }

  // Seed questions + answers
  console.log('\n❓ Seeding VINS FAQs...');
  let total = 0;
  for (const faq of FAQS) {
    const catId = catMap[faq.section];
    if (!catId) {
      console.warn(`   ⚠️  Unknown section: ${faq.section}`);
      continue;
    }

    // Create question
    const question = await Question.create({
      title: faq.question,
      description: faq.answer, // question body doubles as the detailed answer prompt
      category: catId,
      tags: faq.tags.slice(0, 5),   // model enforces max 5 tags
      author: admin._id,
      status: 'open',
      upvotes: Math.floor(Math.random() * 80) + 20,
      downvotes: Math.floor(Math.random() * 5),
      voteScore: Math.floor(Math.random() * 80) + 15,
      viewCount: Math.floor(Math.random() * 500) + 100,
      clickCount: Math.floor(Math.random() * 600) + 150,
      answerCount: 1,
      trendingScore: Math.floor(Math.random() * 60) + 30,
    });

    // Create accepted answer
    await Answer.create({
      questionId: question._id,
      content: faq.answer,
      author: admin._id,
      upvotes: Math.floor(Math.random() * 60) + 10,
      downvotes: 0,
      voteScore: Math.floor(Math.random() * 60) + 10,
      isAccepted: true,
    });

    // Bump category count
    await Category.findByIdAndUpdate(catId, { $inc: { questionCount: 1 } });
    total++;
    process.stdout.write(`\r   📝 Seeded ${total}/${FAQS.length} FAQs...`);
  }

  // Update admin answer/question counts
  await User.findByIdAndUpdate(admin._id, {
    $inc: { questionCount: FAQS.length, answerCount: FAQS.length, reputation: FAQS.length * 10 },
  });

  console.log(`\n\n✅ Done! Seeded ${total} VINS FAQs across ${VINS_CATEGORIES.length} categories.\n`);

  // Print summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  for (const cat of VINS_CATEGORIES) {
    const count = FAQS.filter((f) => f.section === cat.slug).length;
    console.log(`  ${cat.name.padEnd(28)} ${count} FAQs`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Total: ${total} questions + ${total} accepted answers`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('\n❌ VINS seed failed:', err);
  process.exit(1);
});
