<script setup lang="ts">
interface Clue {
  stem: string
  opts: string[]
  ans: number
  why: string
}

interface Category {
  name: string
  qs: Clue[]
}

const VALUES = [100, 200, 300, 400]

const CATS: Category[] = [
  {
    name: 'ADCS 101',
    qs: [
      {
        stem: 'How many self-care behaviors make up the ADCES7 framework?',
        opts: ['5', '6', '7', '10'],
        ans: 2,
        why: 'ADCES7 covers healthy coping, healthy eating, being active, taking medication, monitoring, reducing risks and problem solving. Education and support plans are organized around these seven behaviors.',
      },
      {
        stem: 'Which A1C value meets the diagnostic threshold for diabetes?',
        opts: ['≥ 5.7%', '≥ 6.0%', '≥ 6.5%', '≥ 7.0%'],
        ans: 2,
        why: 'An A1C of 6.5% or higher is diagnostic (confirmed by repeat testing unless clear clinical signs). 5.7–6.4% indicates prediabetes.',
      },
      {
        stem: 'Which fasting plasma glucose value meets the diagnostic threshold for diabetes?',
        opts: ['≥ 110 mg/dL', '≥ 126 mg/dL', '≥ 140 mg/dL', '≥ 200 mg/dL'],
        ans: 1,
        why: 'FPG ≥ 126 mg/dL after at least 8 hours without caloric intake is diagnostic. 100–125 mg/dL is impaired fasting glucose; 200 mg/dL applies to the 2-hour OGTT or a random glucose with symptoms.',
      },
      {
        stem: 'Level 2 (clinically significant) hypoglycemia is defined as glucose below which value?',
        opts: ['70 mg/dL', '54 mg/dL', '40 mg/dL', '60 mg/dL'],
        ans: 1,
        why: 'Level 1 is < 70 and ≥ 54 mg/dL; Level 2 is < 54 mg/dL; Level 3 is a severe event with altered mental or physical status requiring assistance, regardless of the glucose value.',
      },
    ],
  },
  {
    name: 'RIGHT DRUG, RIGHT TIME',
    qs: [
      {
        stem: 'Which drug class lowers glucose mainly by increasing urinary glucose excretion?',
        opts: ['DPP-4 inhibitors', 'SGLT2 inhibitors', 'Sulfonylureas', 'Thiazolidinediones'],
        ans: 1,
        why: 'SGLT2 inhibitors block glucose reabsorption in the proximal tubule, increasing glucosuria. DPP-4 inhibitors raise incretin levels, sulfonylureas stimulate insulin secretion, and TZDs improve insulin sensitivity.',
      },
      {
        stem: 'A patient with type 2 diabetes has heart failure with reduced ejection fraction. Which class is recommended to reduce HF hospitalization?',
        opts: ['SGLT2 inhibitor', 'Thiazolidinedione', 'Sulfonylurea', 'Saxagliptin'],
        ans: 0,
        why: 'SGLT2 inhibitors reduce HF hospitalization and cardiovascular death in HFrEF. TZDs cause fluid retention and should be avoided in symptomatic HF; saxagliptin was linked to more HF hospitalizations in SAVOR-TIMI 53.',
      },
      {
        stem: 'A 58-year-old with type 2 diabetes and established ASCVD has an A1C of 8.2% on metformin. Which addition has proven cardiovascular benefit?',
        opts: ['Glipizide', 'Sitagliptin', 'Semaglutide', 'Pioglitazone'],
        ans: 2,
        why: 'GLP-1 receptor agonists with demonstrated CV benefit (e.g., semaglutide, liraglutide, dulaglutide) reduce major adverse cardiovascular events and are recommended for people with ASCVD independent of A1C. Sitagliptin was CV-neutral in TECOS; glipizide has no CV benefit and adds hypoglycemia risk; pioglitazone causes weight gain and fluid retention.',
      },
      {
        stem: 'When should rapid-acting mealtime insulin (e.g., lispro or aspart) usually be given?',
        opts: ['0–15 minutes before the meal', '60 minutes before the meal', 'At bedtime', '2 hours after the meal'],
        ans: 0,
        why: 'Rapid-acting analogs start working in about 15 minutes, so dosing 0–15 minutes before eating matches the post-meal glucose rise. Ultra-rapid formulations can be given at the start of the meal.',
      },
    ],
  },
  {
    name: 'SHOW ME THE DATA',
    qs: [
      {
        stem: 'What A1C goal is appropriate for many nonpregnant adults with diabetes?',
        opts: ['< 8.5%', '< 7.0%', '< 6.0%', '< 5.7%'],
        ans: 1,
        why: 'ADA Standards of Care recommend an A1C goal below 7% for many nonpregnant adults without significant hypoglycemia, individualized up or down based on patient factors.',
      },
      {
        stem: 'Which trial showed that empagliflozin reduced cardiovascular death in type 2 diabetes with established CVD?',
        opts: ['EMPA-REG OUTCOME', 'LEADER', 'SUSTAIN-6', 'DECLARE-TIMI 58'],
        ans: 0,
        why: 'EMPA-REG OUTCOME (2015) showed a 38% relative reduction in CV death with empagliflozin. LEADER and SUSTAIN-6 studied GLP-1 RAs; DECLARE-TIMI 58 studied dapagliflozin.',
      },
      {
        stem: 'The LEADER cardiovascular outcomes trial evaluated which agent?',
        opts: ['Semaglutide', 'Liraglutide', 'Dulaglutide', 'Exenatide'],
        ans: 1,
        why: 'LEADER (2016) showed liraglutide reduced 3-point MACE by 13% versus placebo in high-risk type 2 diabetes. Semaglutide was studied in SUSTAIN-6, dulaglutide in REWIND, exenatide in EXSCEL.',
      },
      {
        stem: 'In the Diabetes Prevention Program, intensive lifestyle intervention reduced type 2 diabetes incidence by about how much?',
        opts: ['18%', '31%', '58%', '75%'],
        ans: 2,
        why: 'Lifestyle intervention (≈ 7% weight loss and 150 min/week of activity) cut incidence by 58%, compared with 31% for metformin, over about 3 years.',
      },
    ],
  },
  {
    name: 'CGM CORNER',
    qs: [
      {
        stem: 'What is the standard CGM target range used for Time in Range (TIR)?',
        opts: ['70–140 mg/dL', '70–180 mg/dL', '80–200 mg/dL', '54–250 mg/dL'],
        ans: 1,
        why: 'The International Consensus on Time in Range defines the target range as 70–180 mg/dL for most people with type 1 or type 2 diabetes.',
      },
      {
        stem: 'For most adults with type 1 or type 2 diabetes, what is the recommended TIR goal?',
        opts: ['> 50%', '> 60%', '> 70%', '> 90%'],
        ans: 2,
        why: 'Spending more than 70% of the time in range (about 16 h 48 min per day) is the consensus goal and corresponds roughly to an A1C of 7%.',
      },
      {
        stem: 'What is the goal for time below range (< 70 mg/dL) for most adults?',
        opts: ['< 1%', '< 4%', '< 10%', '< 25%'],
        ans: 1,
        why: 'Consensus targets are < 4% of readings below 70 mg/dL (under 1 hour per day) and < 1% below 54 mg/dL (under 15 minutes per day).',
      },
      {
        stem: 'How much CGM data is needed for a reliable Ambulatory Glucose Profile (AGP) report?',
        opts: ['50% of readings over 7 days', '70% of readings over 14 days', '90% of readings over 30 days', '100% of readings over 3 days'],
        ans: 1,
        why: 'At least 14 days of data with about 70% sensor wear is recommended for AGP metrics to reflect longer-term glycemic patterns.',
      },
    ],
  },
  {
    name: 'LIFESTYLE Rx',
    qs: [
      {
        stem: 'How much moderate-to-vigorous physical activity per week is recommended for most adults with diabetes?',
        opts: ['75 minutes', '100 minutes', '150 minutes', '300 minutes'],
        ans: 2,
        why: 'ADA recommends at least 150 minutes per week of moderate-to-vigorous aerobic activity spread over at least 3 days, with no more than 2 consecutive days without activity.',
      },
      {
        stem: 'What amount of weight loss is generally needed to start seeing glycemic benefits in type 2 diabetes with overweight or obesity?',
        opts: ['≥ 1%', '≥ 5%', '≥ 25%', '≥ 40%'],
        ans: 1,
        why: 'Modest weight loss of at least 5% improves glycemia, blood pressure and lipids. Larger, sustained losses (≥ 15%) can have disease-modifying effects, including remission.',
      },
      {
        stem: 'Under the “Rule of 15” for treating hypoglycemia, what should a conscious patient do?',
        opts: ['Take 5 g of carbs and recheck in 30 minutes', 'Take 15 g of fast-acting carbs and recheck in 15 minutes', 'Take 30 g of carbs and recheck in 60 minutes', 'Take 50 g of carbs and recheck in 5 minutes'],
        ans: 1,
        why: 'Give 15–20 g of fast-acting glucose, recheck in 15 minutes and repeat if still low. Once glucose returns to normal, a meal or snack helps prevent recurrence.',
      },
      {
        stem: 'How often should adults with diabetes interrupt prolonged sitting?',
        opts: ['Every 30 minutes', 'Every 2 hours', 'Every 4 hours', 'Every 8 hours'],
        ans: 0,
        why: 'ADA recommends breaking up prolonged sitting every 30 minutes with brief light activity (e.g., standing or walking) for its benefits on blood glucose.',
      },
    ],
  },
]

const LETTERS = ['A', 'B', 'C', 'D']
const CONTROL = 'John D.'
const ANSWERED = new Set([
  '0-0', '0-1', '0-2',
  '1-0', '1-1',
  '2-0', '2-1',
  '3-0', '3-1', '3-2',
  '4-0', '4-1',
])

const activeKey = ref<string | null>('1-2')

const clueNo = Math.min(20, ANSWERED.size + 1)

const columns = computed(() => CATS.map((category, categoryIndex) => ({
  name: category.name,
  tiles: VALUES.map((value, valueIndex) => {
    const key = `${categoryIndex}-${valueIndex}`
    const answered = ANSWERED.has(key)
    const active = activeKey.value === key
    const state = answered ? 'Answered' : (active ? 'Active' : '')
    return {
      key,
      value,
      answered,
      active,
      state,
      label: `${category.name} for ${value}${answered ? ', answered' : (active ? ', active clue' : ', unanswered')}`,
    }
  }),
})))

const clue = computed(() => {
  if (!activeKey.value) return null
  const [categoryIndex, valueIndex] = activeKey.value.split('-').map(Number)
  const category = CATS[categoryIndex]
  const question = category?.qs[valueIndex]
  if (!category || !question) return null
  return {
    cat: category.name,
    val: VALUES[valueIndex],
    ...question,
  }
})

const options = computed(() => {
  if (!clue.value) return []
  return clue.value.opts.map((text, index) => ({
    letter: LETTERS[index],
    text,
    correct: index === clue.value?.ans,
  }))
})

const status = computed(() => {
  if (!clue.value) {
    return {
      title: 'Audience is viewing the game board',
      sub: `${CONTROL} has board control.`,
    }
  }
  return {
    title: 'Buzzers closed',
    sub: 'Read the clue aloud, then open buzzers.',
  }
})

function selectTile(key: string) {
  if (ANSWERED.has(key)) return
  activeKey.value = key
}

function showBoard() {
  activeKey.value = null
}
</script>

<template>
  <div class="flex min-h-full flex-col gap-4 xl:h-full xl:min-h-0 xl:flex-row xl:px-5 xl:py-4">
    <div class="flex w-full min-w-0 flex-col gap-3 xl:h-full xl:w-[640px] xl:min-h-0 xl:shrink-0">
      <section aria-label="Board control" class="ctl">
        <span class="ctl-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z" />
          </svg>
        </span>
        <div class="min-w-0 flex-1">
          <div class="text-[11px] font-bold leading-4 tracking-[0.1em] text-[#5B4A00]">BOARD CONTROL</div>
          <div class="flex flex-wrap items-center gap-2 text-base leading-[22px]">
            <span class="ctl-av" aria-hidden="true">JD</span>
            <strong>{{ CONTROL }}</strong>
            <span class="text-muted">picks the next category &amp; value</span>
          </div>
        </div>
        <span class="ctl-score">800 pts</span>
        <span class="whitespace-nowrap text-[13px] text-muted tabular-nums">
          Clue <strong class="text-on-surface">{{ clueNo }}</strong> of 20
        </span>
      </section>

      <section class="board min-h-[480px] xl:min-h-0" aria-labelledby="board-title">
        <h2 id="board-title" class="sr">Moderator Game Board</h2>
        <div class="grid min-h-0 flex-1 grid-cols-5 gap-2">
          <div v-for="column in columns" :key="column.name" class="flex min-h-0 flex-col gap-2">
            <div class="cat">{{ column.name }}</div>
            <button
              v-for="tile in column.tiles"
              :key="tile.key"
              type="button"
              class="tile"
              :class="{ active: tile.active, done: tile.answered }"
              :aria-label="tile.label"
              :aria-disabled="tile.answered"
              :disabled="tile.answered"
              @click="selectTile(tile.key)"
            >
              <span class="tv">{{ tile.value }}</span>
              <span class="tstate">{{ tile.state }}</span>
            </button>
          </div>
        </div>
        <div class="flex items-center gap-[18px] px-1 pt-0.5 text-xs text-[#C9D3EC]">
          <span class="font-bold tracking-[0.08em] text-white">MODERATOR GAME BOARD</span>
          <span class="ml-auto inline-flex items-center gap-1.5">
            <i class="lg border border-[#5B8DEF] bg-[#0A56D0]" />Unanswered
          </span>
          <span class="inline-flex items-center gap-1.5"><i class="lg bg-[#FFE08A]" />Active</span>
          <span class="inline-flex items-center gap-1.5"><i class="lg bg-[#26324F]" />Answered</span>
        </div>
      </section>

      <div role="group" aria-label="Game controls" class="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-3">
        <button type="button" class="act blue off" disabled aria-disabled="true">
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
          Open Buzzers
        </button>
        <button type="button" class="act red off" disabled aria-disabled="true">
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
          Re-open Buzzers · Steal
        </button>
        <button type="button" class="act tonal" :class="{ off: !clue }" :disabled="!clue" :aria-disabled="!clue" @click="showBoard">
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z" />
          </svg>
          Show Game Board
        </button>
      </div>
    </div>

    <section class="qcc" aria-labelledby="qcc-title">
      <div class="flex items-center gap-2.5 border-b border-divider px-4 py-3">
        <h2 id="qcc-title" class="m-0 whitespace-nowrap text-base font-medium leading-[22px]">
          Question Control Center
        </h2>
        <span class="aud" :class="{ clue: !!clue }">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
          </svg>
          Audience: {{ clue ? 'Clue' : 'Game Board' }}
        </span>
      </div>

      <div v-if="!clue" class="flex flex-1 flex-col items-center justify-center gap-2.5 px-6 py-6 text-center text-muted">
        <svg aria-hidden="true" width="48" height="48" viewBox="0 0 24 24" fill="#8E9199">
          <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z" />
        </svg>
        <div class="text-[17px] font-medium leading-6 text-on-surface">No clue loaded</div>
        <div class="max-w-[320px] text-sm leading-5">
          Ask <strong>{{ CONTROL }}</strong> for a category and value, then tap that tile on the board to load the clue.
        </div>
      </div>

      <div v-else class="flex min-h-0 flex-1 flex-col gap-2.5 overflow-auto px-4 pb-3 pt-3.5">
        <div class="flex items-center gap-2">
          <span class="qtag">{{ clue.cat }}</span>
          <span class="qval">{{ clue.val }} pts</span>
          <span class="ml-auto text-xs text-muted">Answer key visible to moderator only</span>
        </div>
        <p class="m-0 text-[17px] font-medium leading-6">{{ clue.stem }}</p>
        <ol class="m-0 flex list-none flex-col gap-1.5 p-0">
          <li v-for="option in options" :key="option.letter" class="opt" :class="{ correct: option.correct }">
            <span class="ol">{{ option.letter }}</span>
            <span class="flex-1">{{ option.text }}</span>
            <span v-if="option.correct" class="okchip">
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Correct
            </span>
          </li>
        </ol>
        <div class="autonote">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="#44474E" class="shrink-0">
            <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
          </svg>
          The player who buzzes in picks A–D on their phone. The system grades the answer, applies points and passes board control automatically.
        </div>
        <div class="why">
          <div class="mb-1 text-[11px] font-bold tracking-[0.08em] text-muted">CLINICAL EXPLANATION / RATIONALE</div>
          <div class="text-[13px] leading-[19px] text-on-surface">{{ clue.why }}</div>
        </div>
      </div>

      <div class="st idle" role="status">
        <span class="stdot" aria-hidden="true" />
        <div class="min-w-0 flex-1">
          <div class="text-sm font-bold leading-5">{{ status.title }}</div>
          <div class="text-xs leading-4 opacity-90">{{ status.sub }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ctl {
  min-height: 64px;
  height: auto;
  flex-shrink: 0;
  box-sizing: border-box;
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  border-radius: 16px;
  background: #fff4d1;
  border: 1px solid #f0d98a;
}

.ctl-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #ffe08a;
  color: #3a2a00;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ctl-av {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #0a56d0;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ctl-score {
  height: 28px;
  padding: 0 10px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e5d18a;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.board {
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
  padding: 10px;
  border-radius: 16px;
  background: #0b1f4d;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cat {
  height: 46px;
  flex-shrink: 0;
  box-sizing: border-box;
  padding: 0 6px;
  border-radius: 10px;
  background: #08439f;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 12px;
  line-height: 15px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.tile {
  flex: 1;
  min-height: 0;
  border: 1px solid #5b8def;
  border-radius: 10px;
  background: #0a56d0;
  color: #ffe08a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  font: inherit;
  padding: 0;
}

.tile:hover {
  background: #1765e3;
}

.tile:focus-visible {
  outline: 3px solid #ffffff;
  outline-offset: 2px;
}

.tv {
  font-size: 24px;
  line-height: 28px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.tstate {
  font-size: 11px;
  line-height: 14px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  min-height: 14px;
}

.tile.active {
  background: #ffe08a;
  border-color: #ffe08a;
  color: #3a2a00;
  animation: tilepulse 1.4s ease-in-out infinite;
}

.tile.active .tv {
  text-shadow: none;
}

.tile.done,
.tile.done:hover {
  background: #26324f;
  border-color: #26324f;
  color: #66718e;
  cursor: not-allowed;
}

.tile.done .tv {
  text-decoration: line-through;
  text-shadow: none;
  font-weight: 500;
}

.lg {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  display: inline-block;
  box-sizing: border-box;
}

.act {
  height: 56px;
  border: 0;
  border-radius: 16px;
  font: inherit;
  font-size: 14px;
  line-height: 18px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  padding: 0 10px;
  text-align: center;
}

.act.blue {
  background: #0a56d0;
  color: #ffffff;
}

.act.red {
  background: #ba1a1a;
  color: #ffffff;
}

.act.tonal {
  background: #dce2f9;
  color: #141b2c;
}

.act:hover {
  filter: brightness(1.08);
}

.act:focus-visible {
  outline: 3px solid #1a1c1e;
  outline-offset: 2px;
}

.act.off,
.act.off:hover {
  background: #e3e3e7;
  color: #9a9ca3;
  cursor: not-allowed;
  filter: none;
}

.qcc {
  flex: 1;
  min-width: 0;
  background: #ffffff;
  border: 1px solid #c4c6d0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.aud {
  margin-left: auto;
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  background: #eceef2;
  color: #44474e;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.aud.clue {
  background: #eaddff;
  color: #21005d;
}

.qtag {
  height: 24px;
  padding: 0 9px;
  border-radius: 12px;
  background: #dae2ff;
  color: #001849;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.qval {
  height: 24px;
  padding: 0 9px;
  border-radius: 12px;
  background: #ffe08a;
  color: #3a2a00;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.opt {
  min-height: 40px;
  box-sizing: border-box;
  padding: 6px 10px;
  border: 1px solid #c4c6d0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  line-height: 19px;
}

.ol {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #eceef2;
  color: #1a1c1e;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.opt.correct {
  border-color: #146c2e;
  background: #edf8ee;
}

.opt.correct .ol {
  background: #146c2e;
  color: #ffffff;
}

.okchip {
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  background: #c4eed0;
  color: #002107;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}

.autonote {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: #f2f3f7;
  font-size: 12px;
  line-height: 16px;
  color: #44474e;
}

.why {
  padding: 10px 12px;
  border-radius: 10px;
  background: #f2f3f7;
  border-left: 4px solid #6750a4;
}

.st {
  margin: 0 16px 14px;
  padding: 10px 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  box-sizing: border-box;
}

.stdot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  background: currentColor;
}

.st.idle {
  background: #eceef2;
  color: #44474e;
}

.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

@keyframes tilepulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 224, 138, 0.75);
  }

  50% {
    box-shadow: 0 0 0 7px rgba(255, 224, 138, 0);
  }
}
</style>
