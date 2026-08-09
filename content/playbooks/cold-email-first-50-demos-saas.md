---
slug: cold-email-first-50-demos-saas
title: "Cold email for SaaS founders: the 4-touch sequence for your first 50 demos"
summary: >-
  A founder-run outbound sequence for pre-PMF B2B SaaS: build a 1,400-contact list
  from one trigger event, send four touches over 14 days, and book demos without a
  sales hire.

channel: cold-email
icps:
  - saas-founders
motion: outbound
difficulty: intermediate

timeToFirstLead: "7–14 days"
costToRun: "~$120/mo"
stack:
  - apollo
  - instantly
  - clay

author:
  handle: aleadmate
  name: aLeadMate
  bio: Curated seed playbooks from the aLeadMate team.

curated: true
publishedAt: "2026-08-09"
updatedAt: "2026-08-09"

rightsConfirmed: true

funnel:
  slug: founder-outbound-funnel
  name: Founder-led outbound, list to booked demo
  stages:
    - key: list
      label: Trigger-based list build
      description: >-
        One trigger event, not a job title. Everyone on the list did something
        recently that makes your product relevant this month.
      benchmarkLabel: Contacts
      benchmarkValue: "1,400"
    - key: deliverability
      label: Verify and warm
      description: >-
        Separate sending domain, warmed for three weeks, list scrubbed twice.
        Skipping this is the single most common reason the whole thing fails.
      benchmarkLabel: Deliverable
      benchmarkValue: "96%"
    - key: sequence
      label: 4-touch sequence
      description: Four emails over 14 days, each one shorter than the last.
      benchmarkLabel: Reply rate
      benchmarkValue: "7.4%"
      flowSlug: founder-4-touch
    - key: triage
      label: Reply triage
      description: >-
        Every reply answered within four business hours, by the founder, from a
        real inbox.
      benchmarkLabel: Positive replies
      benchmarkValue: "2.4%"
    - key: demo
      label: Booked demo
      description: One link, one time zone, no back-and-forth.
      benchmarkLabel: Demos
      benchmarkValue: "26"

flows:
  - slug: founder-4-touch
    name: The 4-touch founder-to-founder sequence
    goal: >-
      Get a reply from a technical founder or head of growth who has just shipped
      something that makes your product timely.
    exitCriteria:
      - They reply, in any tone
      - They book a call
      - They ask to be removed, or unsubscribe
      - The address hard-bounces
      - They have left the company since the list was built
    steps:
      - day: 0
        play:
          slug: touch-1-observation
          kind: email
          name: "Touch 1 — the specific observation"
          hook: "{{company}} + {{trigger_event}}"
          body: |-
            Hi {{first_name}},

            Saw {{company}} shipped {{trigger_event}}. Nice work — that is a
            genuinely hard one to get right.

            The reason I am writing: in my experience that ships a second problem
            about six weeks later, once usage catches up with it.

            {{peer_company}} hit the same wall and {{outcome_claim}}.

            Worth fifteen minutes to see whether the same thing applies to you?

            {{sender_name}}
          rationale: >-
            The trigger event does the qualifying. Because it is recent, specific,
            and public, it proves a human looked — which is the only thing that
            separates this from the forty other emails in the inbox that morning.
          variables:
            - token: "{{first_name}}"
              description: Recipient's first name
              example: Priya
            - token: "{{company}}"
              description: Their company name
              example: Northwind
            - token: "{{trigger_event}}"
              description: The specific recent event that put them on the list
              example: your public API
            - token: "{{peer_company}}"
              description: A customer they would recognise as a peer, not an aspiration
              example: Grovewell
            - token: "{{outcome_claim}}"
              description: One concrete, defensible outcome — a number, not an adjective
              example: cut onboarding time from 9 days to 2
            - token: "{{sender_name}}"
              description: Your first name only

      - day: 3
        condition: no reply to touch 1
        play:
          slug: touch-2-bump
          kind: email
          name: "Touch 2 — the one-line bump"
          hook: "Re: {{company}} + {{trigger_event}}"
          body: |-
            Worth a look, {{first_name}}, or is this the wrong quarter for it?

            {{sender_name}}
          rationale: >-
            Threaded under the original so it reads as a follow-up rather than a
            new pitch. Offering the easy no is what makes it get answered — a
            reply of "wrong quarter" is a real result and gets them a calendar
            reminder rather than a delete.
          variables:
            - token: "{{first_name}}"
              description: Recipient's first name
            - token: "{{company}}"
              description: Their company name
            - token: "{{trigger_event}}"
              description: Same trigger event as touch 1, so the thread stays coherent
            - token: "{{sender_name}}"
              description: Your first name only

      - day: 7
        condition: still no reply
        play:
          slug: touch-3-proof
          kind: email
          name: "Touch 3 — swap the pitch for proof"
          hook: "how {{peer_company}} handled {{problem}}"
          body: |-
            {{first_name}} — not chasing a meeting, just thought this was useful.

            {{peer_company}} had the same problem after they shipped theirs. What
            actually worked for them:

            1. {{step_one}}
            2. {{step_two}}
            3. {{step_three}}

            Took about three weeks. Happy to send the full breakdown if it is
            relevant — no call needed.

            {{sender_name}}
          rationale: >-
            The third touch is where most sequences repeat the pitch and get
            filtered. Giving away the method instead earns a reply from people who
            were never going to book from touch one, and it costs you nothing —
            they still need the product to execute it at any scale.
          variables:
            - token: "{{first_name}}"
              description: Recipient's first name
            - token: "{{peer_company}}"
              description: The same peer customer used in touch 1
            - token: "{{problem}}"
              description: The problem in their words, not your category name
              example: onboarding drop-off
            - token: "{{step_one}}"
              description: First concrete step, specific enough to act on today
            - token: "{{step_two}}"
              description: Second concrete step
            - token: "{{step_three}}"
              description: Third concrete step
            - token: "{{sender_name}}"
              description: Your first name only

      - day: 14
        condition: still no reply
        play:
          slug: touch-4-close-the-loop
          kind: email
          name: "Touch 4 — close the loop"
          hook: "closing the loop"
          body: |-
            {{first_name}} — assuming this is not a priority right now, so I will
            stop here.

            If that changes, reply to this and it comes straight back to me.

            {{sender_name}}
          rationale: >-
            Not a guilt trip and not a fake deadline. Roughly a third of the
            positive replies in the reported run came from this email, because it
            is the first one that asks for nothing.
          variables:
            - token: "{{first_name}}"
              description: Recipient's first name
            - token: "{{sender_name}}"
              description: Your first name only

results:
  - label: Reply rate
    value: 7.4
    unit: percent
    sampleSize: 1400
    period: "2026-03"
    proofTier: unverified
    note: >-
      All replies including negative and out-of-office. Single sending domain,
      warmed three weeks before the first send.
  - label: Positive reply rate
    value: 2.4
    unit: percent
    sampleSize: 1400
    period: "2026-03"
    proofTier: unverified
    note: Replies asking for a call, a demo, or more detail.
  - label: Demos booked
    value: 26
    unit: count
    sampleSize: 1400
    period: "2026-03"
    proofTier: unverified
  - label: Cost per booked demo
    value: 34
    unit: currency
    currency: USD
    sampleSize: 1400
    period: "2026-03"
    proofTier: unverified
    note: Tooling and data costs only. Founder time is not counted.
---

## Who this is for

Pre-product-market-fit B2B SaaS, founder still doing the selling, no sales hire yet,
average contract value somewhere between $3k and $30k a year. Below that range the
economics do not survive a founder's hourly cost. Above it, this sequence gets you
the first meeting but not the deal — you will need a real multi-threaded motion.

It assumes you can name one **trigger event** that makes your product relevant *this
month*. If you cannot, stop here and go find one. Every part of what follows depends
on it, and no amount of sequence tuning rescues a list built on job titles alone.

## Why it works

Most founder outbound fails for one of three reasons, and none of them is the copy.

**The list is a title filter.** "Head of Growth at a Series A SaaS" describes eleven
thousand people who have nothing in common this week. A trigger event — they shipped
an API, they posted a role, they migrated a billing provider — describes people with
a shared, dated, checkable problem. The list *is* the targeting.

**The domain is cold.** Sending from your primary domain on day one is how you lose
the domain. A separate sending domain, three weeks of warming, and a list scrubbed
twice is unglamorous and is most of the difference between 96% deliverable and a
spam folder.

**The sequence repeats itself.** Four touches that each restate the pitch train the
reader to ignore the thread. The version here gets shorter each time and changes what
it asks for: a meeting, then an easy no, then nothing at all except something useful,
then permission to stop.

## Building the list

1. Pick one trigger event you can detect at scale. Public changelogs, job postings,
   funding announcements, and tech-stack changes all work. Pick the one that maps
   most directly to the problem you solve.
2. Pull companies matching that trigger from the last 60 days. Older than that and
   the observation stops feeling recent.
3. Find one contact per company. One. Two contacts at the same company on the same
   week reads as spray, and it is the fastest way to get blocked at the domain level.
4. Verify twice, with two different providers. Anything ambiguous gets dropped, not
   guessed. A 2% bounce rate is the ceiling you are protecting.
5. Cap the daily send at 40 per inbox. Volume beyond that buys you deliverability
   problems, not meetings.

At 1,400 contacts and 40 a day across two inboxes, the full sequence runs about five
weeks end to end.

## Handling replies

Every reply gets answered by the founder, from a real inbox, inside four business
hours. This is not a nice-to-have — response time was the strongest single lever in
the reported run, ahead of any copy change.

- **Positive** — send one calendar link, one time zone, no negotiation.
- **"Wrong quarter"** — thank them, ask for the month, put a reminder in. This
  converts better than anything else in the sequence at the six-month mark.
- **Negative** — remove them and say so. It costs you nothing and it is the reason
  your domain still works next quarter.
- **Out of office** — pause the sequence to the return date. Sending touch 3 into an
  empty inbox wastes the best email in the set.

## What breaks

**The claim is an adjective.** "Dramatically faster onboarding" is noise.
"From 9 days to 2" is a reason to reply. If you cannot put a number on the outcome
yet, use a customer's words verbatim instead — an honest quote outperforms a vague
metric.

**The peer company is aspirational.** Naming a company ten times their size reads as
a flex and invites the "we are not like them" objection. Name someone their size.

**Touch 3 gets skipped.** It is the one that requires actual work — you have to know
something useful. It is also where the compounding is, because it is the only email
in the set a recipient might forward.

**The sequence gets extended to eight touches.** Reply rate does not go up. Spam
complaints do.

## Adapting it

For **agencies selling to e-commerce**, swap the trigger to a platform migration or a
new ad-account spike and shorten to three touches — the cycle is faster and touch 4
lands after the decision is already made.

For **enterprise IT**, keep all four touches but stretch to 28 days and replace the
demo ask with a shorter, lower-commitment artefact. Nobody books a demo from a cold
email at that deal size; they will read a one-page teardown.

For **local services**, this whole motion is the wrong tool. Use the phone.
