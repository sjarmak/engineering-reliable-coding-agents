# Companion learnings

This human-readable edition presents all 192 practices in chapter context. For navigation, filtering, and graph exploration, use the [website companion](https://sjarmak.ai/books/engineering-reliable-coding-agents/companion).

This catalog indexes all 192 practices in the book’s corpus. Fifty-five are taught in the book’s eighteen chapters, and 137 are attached to those chapters’ mechanisms without being taught there. The catalog brings both groups together so that a reader scanning one chapter’s neighborhood can see every related practice, not only those the chapter leaves to the catalog. It also makes visible the difference between practices the book argues in full and practices it records as additional possibilities.

Read the relevant chapter before using its catalog section. The chapter establishes the mechanism, develops the reasoning, examines the evidence, and sets the boundaries needed to judge whether a practice fits a measured problem or operating constraint. The catalog helps locate and compare practices around that mechanism, but it does not make the chapter’s argument optional. Begin with a problem you have observed, not with a practice you would like to adopt.

Under each chapter heading, the taught practices and the untaught practices appear in separate groups. The taught practices are represented by short pointer entries of two or three sentences. Each pointer identifies the action, states its relationship to the chapter, and directs the reader to the chapter for the developed account. Its brevity is deliberate. Compressing the chapter’s argument, evidence, and boundary into a catalog summary would create a weaker duplicate and might make the practice seem transferable without the qualifications that justify it. A pointer therefore tells you what the chapter teaches and where to read it, while leaving the teaching itself intact.

The 137 practices not taught by any chapter appear as full compact entries. Every practice has an action title and a stable identifier that can be cited, linked, or tracked across revisions. A compact entry then uses two or three paragraphs to describe what to do, how the action produces its intended result, what evidence supports it, and where its use stops being justified. The evidence appears in prose with a plain-language marker of its strength and scope. The entry closes on a boundary such as a cost, dependency, transfer risk, failure condition, or limit in the available support. The group labels and the visibly different entry lengths allow readers to distinguish pointers from compact entries at a glance.

Entries are grouped by chapter because the chapter is where the relevant mechanism is established. A topic-based arrangement might place superficially similar practices together while separating a variant from the assumptions that make it intelligible. Keeping every practice beside its underlying mechanism gives taught and untaught options a common reference point for comparison. It also prevents a compact description from appearing more self-sufficient than it is.

Read each evidence marker as a constraint on the adoption decision. A measured result supports a claim only within the conditions under which it was observed. Transferring that result requires checking whether the workload, system, and failure mechanism remain comparable. Evidence that supports a direction without establishing a magnitude can justify trying a change, but it cannot determine how large the change should be or how much improvement to expect. A single reported case establishes that a failure or intervention can occur; it does not establish how common, typical, or likely it is.

Negative and conflicting findings narrow a recommendation further. When a test found no supported result, the surrounding advice must remain compatible with that outcome and cannot quietly assume the missing benefit. When the evidence corpus contains a counterweight, the compact entry names it so adoption does not depend on seeing only the favorable side. These markers should shape the commitment. Limited support calls for a smaller, more observable trial, while closer agreement between your conditions and the measured conditions permits a firmer decision.

Twenty-nine of the 137 compact entries are marked as thin-support asides. I excluded these practices from the taught set because their support does not justify recommending them. They remain as leads for investigation: possible experiments, unmeasured controls, instrumentable failure modes, or questions that current evidence leaves open. I include them because visible uncertainty serves the reader better than silent omission, provided they are treated as prompts rather than guidance.

Use the catalog after diagnosis, as an index and comparison aid rather than a menu for indiscriminate adoption. Start with the chapter that explains the mechanism behind the problem you measured. Use its pointer entries to recognize what the book develops in full, then assess the neighboring compact entries through their actions, mechanisms, evidence markers, and closing boundaries.

## Chapter 1: Run-to-run variance, statistical power, and paired comparisons

3 taught in the chapter, 10 carried here. 13 practices in total.

The following pointer entries identify the practices taught in Chapter 1, where their full arguments, evidence, and boundaries are developed.

### Compare distributions across randomized repeated runs

`ERCA-020` · `never-report-a-single-run`

Run every evaluation configuration through multiple independent repeats, randomizing nuisance sources such as seeds, data order, and splits, then report the resulting distribution alongside pass@k and pass^k. Use measured run-to-run spread to judge whether an apparent difference is distinguishable from evaluation noise. Chapter 1 develops the experimental design and reporting discipline behind this practice.

### Power-analyze the evaluation before running it

`ERCA-025` · `power-analyze-before-running`

Determine the sample size needed to detect the smallest difference that would change the decision, using explicit significance and power targets plus variance estimated from pilot data. For a fixed evaluation, calculate the minimum detectable effect so null and small-difference results can be interpreted against the design’s actual sensitivity. Chapter 1 works through how to plan and assess this power analysis.

### Compare systems with metric-appropriate paired tests

`ERCA-024` · `use-paired-tests-matched-to-metric`

Compare systems evaluated on the same items by analyzing per-item score differences, and report the paired difference, its standard error, and the correlation between scores. Match the significance test to the metric so the comparison respects how that metric is constructed and how uncertainty should be sampled. Chapter 1 explains the paired design and appropriate testing choices in full.

The following compact entries record practices attached to Chapter 1’s mechanism but not taught in full by any chapter.

### Report correlation-aware standard errors with every evaluation score

`ERCA-023` · `report-correlation-aware-standard-errors`

Attach a standard error of the mean to every reported evaluation score, treating the tested questions as observations drawn from a broader population. When questions share a document, passage, repository, or another source, calculate clustered standard errors at that grouping level. Also use the resulting covariance structure when comparing or ranking systems. Correlated questions repeat some of the same information, so their raw count overstates the effective sample size. An independence-based calculation consequently produces uncertainty intervals that are too narrow and can make an unstable ordering appear settled.

A statistical treatment by Miller ([2024](https://arxiv.org/abs/2411.00640)) developed a central-limit framework for evaluation means and clustered the standard errors of related question groups. In an empirical analysis of major benchmarks, Ailem and colleagues ([2024](https://arxiv.org/abs/2404.16966)) found non-random performance correlations across prompts; accounting for those correlations enlarged naive standard errors and changed model rankings. These corrections require a known grouping structure, and estimates become unstable when only a few clusters are available. They also leave unidentified dependence untreated. The central-limit argument is most direct for single-turn scores, while multi-step agent rollouts may introduce additional dependence. Correlation-aware uncertainty describes sampling within the benchmark and cannot establish that the benchmark represents deployment.

### Estimate pass@k with the unbiased combinatorial estimator

`ERCA-026` · `estimate-pass-at-k-unbiased`

For each problem, generate $n \ge k$ samples, count the $c$ correct samples, and average $1-\binom{n-c}{k}/\binom{n}{k}$ across problems, computing the ratio through its numerically stable product form. Report both $k$ and $n$ with the estimate. Do not substitute an observed per-problem success rate $p$ into $1-(1-p)^k$. That plug-in calculation treats the estimated rate as known, so sampling noise in $p$ produces an upward-biased estimate. The combinatorial calculation instead measures the fraction of size-$k$ subsets among the observed samples that contain at least one success.

In a code-generation evaluation study, Chen and colleagues ([2021](https://arxiv.org/abs/2107.03374)) introduced this combinatorial estimator and showed that it is exactly unbiased for the probability that at least one of $k$ draws succeeds, while the plug-in alternative is biased high. Exact unbiasedness does not make an estimate precise: small $n$ still leaves substantial per-problem variability. Pass@k also measures sampled coverage under an oracle that can recognize a correct candidate. A deployed system cannot realize that coverage unless it has a sufficiently reliable verifier or selector. The estimator transfers to theorem proving, tool use, and other retry-based tasks only when every sampled candidate can be assessed for correctness.

### Correct suite-wide victory claims with replicability analysis

`ERCA-027` · `correct-multi-benchmark-victory-claims`

When claiming that one system beats another across a benchmark suite, apply partial-conjunction testing and report the minimum number $u$ of $N$ datasets on which the advantage is statistically supported. Counting datasets with uncorrected per-dataset p-values gives the comparison repeated opportunities to produce a false win. Partial-conjunction analysis combines those tests while controlling family-wise error, yielding the interpretable statement that the advantage holds on at least $u$ of $N$ datasets. Keep the individual effect estimates and uncertainty beside that count so readers can distinguish consistent useful gains from several detectable but negligible differences.

In a multi-dataset NLP study, Dror and colleagues ([2017](https://arxiv.org/abs/1709.09500)) demonstrated that partial-conjunction testing controls family-wise error and supports statistically valid claims about the minimum number of datasets showing an advantage. The procedure is designed for replication of one system comparison across datasets. It cannot repair a per-dataset test that uses the wrong sampling unit, mismatches the metric’s distribution, or otherwise violates its assumptions. It also does not make related benchmarks substantively independent or show that their shared result transfers to deployment. Use it to bound the suite-level victory claim, while treating benchmark validity and practical effect size as separate questions.

### Rank systems with a paired-comparison model, confidence intervals, and active sampling

`ERCA-029` · `rank-with-paired-comparison-models-and-cis`

When an evaluation collects pairwise preferences, fit a Bradley-Terry model to estimate relative system strengths, publish a confidence interval for every rating, and direct new comparisons toward pairs whose ordering remains uncertain. Screen anomalous voters before aggregation. The model converts wins and losses across heterogeneous prompts and opponents into a common relative scale. Confidence intervals expose rankings that the available comparisons have not resolved, while active pair selection concentrates evaluation effort on matchups that can still change the ordering instead of repeatedly sampling settled comparisons.

In a large human-preference evaluation study, Chiang and colleagues ([2024](https://arxiv.org/abs/2403.04132)) used Bradley-Terry aggregation with published confidence intervals, active pair sampling, and anomalous-voter screening. Their results establish this combination as a workable design for preference leaderboards with uneven comparison data. Its interpretation assumes sufficiently independent, honest votes over a fixed pool of systems. Private testing of many variants followed by selective disclosure changes the candidate set through an unobserved selection process and can distort the resulting ranking. Crowdsourced prompts and voters may also represent no particular deployment population. The intervals quantify uncertainty under the fitted comparison model; they do not correct strategic disclosure, shared voter bias, or a mismatch between the collected prompts and intended use.

### Profile benchmark noise before making decisions and engineer its signal-to-noise ratio upward

`ERCA-030` · `profile-benchmark-noise-before-decisions`

Before using a benchmark to choose a training or engineering change, measure its seed variance and inter-checkpoint variability, then compare the observed delta with that profile. Prefer benchmarks with high signal-to-noise ratio for the decision at hand. Where the evaluation permits, preserve more information with continuous metrics such as choice log-likelihood or bits-per-byte, remove subtasks dominated by noise, and average the last few checkpoints when you control training. These changes reduce irrelevant variation or avoid the information loss caused by converting graded model confidence into thresholded accuracy.

An empirical benchmark-variance study by Madaan and colleagues ([2024](https://arxiv.org/abs/2406.10229)) measured seed and checkpoint variability and found that choice log-likelihood detected weak signals better than discrete accuracy under the studied conditions. Heineman and colleagues ([2025](https://arxiv.org/abs/2508.13144)) analyzed 30 benchmarks and 375 models. In that model collection, high-SNR benchmarks produced small-scale decisions that agreed with large-scale outcomes and yielded lower scaling-law prediction error; the study also found that SNR could be measured in advance and improved through benchmark design.

Published noise profiles transfer only approximately across model families, training regimes, and scales. Continuous metrics lose some of their advantage as discrete scores saturate, and checkpoint averaging is available only when training artifacts are accessible. Measure SNR on the actual decision loop rather than treating it as a permanent benchmark property. Higher SNR cannot rescue a benchmark that measures the wrong capability.

### Declare decoding settings and compare greedy with sampled generation

`ERCA-031` · `declare-decoding-configuration`

Treat decoding as an experimental variable: report whether generation was greedy or sampled, state the temperature and any best-of-N procedure, and evaluate each model under both greedy and sampled generation before claiming a comparison. Decoding changes the distribution of candidate outputs and therefore changes measured capability. Best-of-N additionally changes the number of opportunities for success. If those settings remain implicit, a reported model difference may instead reflect incompatible inference policies, and results produced by separate evaluation harnesses cannot be compared cleanly.

In a comparative evaluation across model sizes and tasks, Song and colleagues ([2024](https://arxiv.org/abs/2407.10457)) found a consistent greedy-versus-sampling gap large enough to reorder model comparisons. Greedy decoding usually won on the studied reasoning tasks, while sampling won on AlpacaEval, and best-of-N sampling allowed small models to beat GPT-4-Turbo under that evaluation setup. The task-dependent direction makes reporting only one undeclared configuration especially misleading.

Alignment methods reduced sampling variance inconsistently across model families, so the size and direction of the gap must be measured again for each model family and task mix. Testing both modes also leaves the production choice open. Latency, generation cost, retry limits, and the availability of a reliable verifier determine whether sampled coverage or best-of-N performance can be delivered in practice.

### Aggregate a handful of runs with IQM, bootstrap intervals, and performance profiles

`ERCA-035` · `aggregate-few-runs-with-iqm-and-bootstrap-cis`

When only a few runs per task are affordable, report the interquartile mean across the suite, attach a stratified-bootstrap confidence interval to every aggregate, and show performance profiles across tasks and runs. IQM limits the influence of extreme task results while using more observations than the median, whose variability can be high and whose result can conceal failures when many scores are zero. Stratified resampling preserves the suite’s task structure, and the resulting intervals reveal apparent differences that the available runs cannot resolve.

Agarwal and colleagues ([2021](https://arxiv.org/abs/2108.13264)) demonstrated this combination in multi-task reinforcement-learning suites with a handful of runs. Their re-analysis using IQM, stratified-bootstrap confidence intervals, and performance profiles overturned published conclusions on ALE, Procgen, and DeepMind Control. The result supports the method within that multi-task evaluation structure and motivates its transfer to agent suites with similarly limited repetition.

The evidence assumes roughly 3 or more runs per task. IQM deliberately discards tail information, so retain performance profiles and report tails directly when rare catastrophic failures or exceptional successes drive the decision. Fixed seeds do not replace repeated runs because GPU execution can remain nondeterministic under seeding. The additional resampling also cannot compensate for tasks or scores that fail to represent the intended capability.

### Validate every benchmark reduction by its effect on decisions

`ERCA-028` · `shrink-evals-with-decision-aware-validation`

Before adopting a cheaper evaluation protocol, estimate its decision-flip rate against the full protocol and retain it only if that rate is acceptable for the decisions the evaluation governs. For item-count reductions, select about 100 informative anchor items using item-response theory, preserve their per-item weights, and periodically refit the selection as the evaluated model population changes. This treats cost reduction as a modification to the measurement instrument and tests whether the modification changes rankings or verdicts.

Perlitz and colleagues ([2023](https://arxiv.org/abs/2308.11696)) introduced DIoR to quantify the decision-flip probability associated with reductions. Their strong empirical comparison found that Flash-HELM preserved rankings at ~200x less compute, while other reductions destroyed them, including reductions that removed whole scenarios. Polo and colleagues ([2024](https://arxiv.org/abs/2402.14992)) found that 100 IRT-curated items reconstructed full MMLU scores within ~2 points at ~1% of the cost. As a specific internal illustration that adds no independent support, one code-evaluation smoke tier reported -23% where its confirmatory run reported -12% directional; it remained useful for tripwires but was disqualified from verdicts.

DIoR inherits every validity defect of the full benchmark because matching its decisions does not establish real-world relevance. IRT selection also depends on the model population used for fitting, becomes less reliable outside the fitted ability range, and requires re-estimation as model families change.

### Pilot the evaluation, pre-commit its design, and confirm once

`ERCA-033` · `precommit-confirmatory-eval-designs`

Use inexpensive pilot runs to choose hyperparameters, metrics, thresholds, and run counts, then record that design before executing the confirmatory experiment once. Keep subsequent design exploration separate from the result being confirmed. When experimenters repeatedly inspect measurements and revise the evaluation until a favorable result appears, they perform implicit multiple testing and adapt the design to noise. A fixed estimand and decision rule make the reported error rates interpretable and allow another evaluator to reproduce the intended test.

Patterson and colleagues ([2023](https://arxiv.org/abs/2304.01315)) provide directional methodological evidence, supported by demonstrations in reinforcement-learning research, for a pilot-then-precommit-then-confirm discipline. Their work identifies repeated design iteration against the same measurements as implicit multiple testing, but it does not quantify the benefit of precommitment across agent evaluations. Several internal cases illustrate enforcement mechanisms without adding independent evidence: one migration evaluation stamped its locked protocol into every result and rejected unstamped numbers, while one preregistered authorship study published a null headline after its required repository diversity failed. These cases establish that mechanical enforcement and unfavorable outcomes can occur, not how frequently they improve reliability.

The discipline adds pilot compute and slows experimentation. During early hypothesis generation, exploratory sweeps may be appropriate, provided their results do not receive confirmatory interpretation. Precommitment also cannot rescue a poorly chosen metric, invalid task population, or decision threshold.

### Measure performance across plausible prompt variants

`ERCA-016` · `report-spread-across-prompt-variants`

Evaluate each model over a sampled set of meaning-preserving prompt variants, including separator, casing, and spacing changes, instruction paraphrases, output-format requests, and greetings, then report the resulting spread or interval. Use max-over-prompts when measuring deliberate product prompt tuning and average-over-prompts when making robustness claims. Record variant-induced prediction churn as part of the pipeline’s error budget. Sampling multiple prompts separates capability from sensitivity to arbitrary harness choices because a format that benefits one model may not benefit another.

Sclar and colleagues ([2023](https://arxiv.org/abs/2310.11324)) found across 53 tasks that meaning-preserving format changes produced a median accuracy spread of 7.5 points and shifts of up to 76 points. Mizrahi and colleagues ([2024](https://arxiv.org/abs/2401.00595)) evaluated 6.5M instances across 20 LLMs and 39 tasks, finding brittle single-prompt rankings and more stable multi-prompt aggregates. Salinas and Morstatter ([2024](https://arxiv.org/abs/2401.03729)) found that trivial variations, including JSON-format requests, greetings, and trailing spaces, flipped over 10% of predictions on some tasks.

Prompt variants multiply evaluation cost. Bandit-style sampling can recover spread within ~1 point only with substantial budget, and a selectively constructed paraphrase set merely relocates prompt-selection bias. Effects are model- and task-specific, shrink without vanishing as scale increases, and have been measured mainly on classification-style and few-shot tasks. The evidence does not yet establish the same behavior for long-horizon agents.

## Chapter 2: Baselines, ablations, and cost-accuracy tradeoffs

2 taught in the chapter, 6 carried here. 8 practices in total.

The following pointer entries identify the practices taught in Chapter 2, where their full arguments, evidence, and boundaries are developed.

### Run controls that isolate each component’s contribution

`ERCA-114` · `run-ablation-controls`

Isolate the contribution of memory, retrieval, or tools by running controls that remove the component, expose raw inputs, match coverage, and vary one factor at a time. Treat tool availability as part of the experimental configuration so gains can be attributed to the mechanism under study. Chapter 2 develops the control designs required for credible ablation claims.

### Evaluate accuracy and cost on a Pareto frontier

`ERCA-012` · `report-cost-accuracy-pareto`

Evaluate an agent on accuracy and inference cost together, plotting the configurations that form the Pareto frontier and recording dollars, token counts, and the applicable pricing snapshot. Include simple baselines and preserve a holdout that development never targets, so system selection reflects both useful performance and resource use. Chapter 2 develops this joint evaluation and comparison framework.

The following compact entries record practices attached to Chapter 2’s mechanism but not taught in full by any chapter.

### Report expected best performance across tuning budgets

`ERCA-034` · `report-performance-vs-tuning-budget`

Plot the expected validation performance of the best configuration found after each number of tuning trials, and publish the search space, sampling procedure, trial count, and selection rule alongside the curve. The winning score rises as a method receives more opportunities to find a favorable configuration, even when its underlying quality remains unchanged. Reporting only that winner therefore mixes method quality with search budget and luck. Dodge and colleagues ([2019](https://arxiv.org/abs/1909.03004)) showed empirically that best-of-B is a biased order statistic and that published method rankings can reverse when tuning budgets are equalized. A budget-conditional curve lets readers compare methods at the amount of compute they can actually spend.

This treatment applies to validation-set selection, including scaffold searches, prompt searches, and AutoML-style sweeps. It does not authorize repeated selection against the final test set or make the selected configuration representative of deployment. The expected-maximum calculation also assumes independent trials drawn from a fixed search distribution. Adaptive and sequential optimizers violate that assumption, and the cited study does not establish an estimator for those searches. A 2021 follow-up by Dodge and colleagues compared three estimators and recommended the biased estimator on mean-squared-error grounds. That recommendation concerns predictive error, not unbiasedness.

### Budget repeated sampling from coverage and verifier limits

`ERCA-036` · `budget-sampling-by-coverage-and-verifier`

Measure coverage at several small sample counts, fit the exponentiated-power-law relationship between coverage and samples, and use the fitted curve to choose a larger sampling budget only after measuring the verifier's false-positive rate. Repeated sampling raises the chance that at least one correct candidate exists, which turns inference compute into a quantity that can be budgeted against expected coverage. Brown and colleagues ([2024](https://arxiv.org/abs/2407.21787)) found that this relationship held over four orders of magnitude; on SWE-bench Lite, coverage rose from 15.9% at one sample to 56% at 250 samples.

Coverage becomes deliverable performance only when the system can identify the correct candidate. Stroebl and colleagues ([2024](https://arxiv.org/abs/2411.17501)) showed that an imperfect verifier creates an accuracy ceiling that additional resampling cannot break. Its false-positive rate correlates with single-sample accuracy, so weaker generators face lower ceilings. Majority voting and learned selectors may plateau beyond a few hundred samples while latent coverage continues to grow. Treat the curve as an upper bound when no automatic verifier exists, and re-estimate it on the target workload rather than importing a benchmark fit. A genuinely sound verifier, such as formal proof checking, changes the regime because incorrect candidates cannot pass. Ordinary tests with limited coverage do not provide that guarantee, so generation and verification costs must be budgeted together.

### Freeze memory before evaluating deployment performance

`ERCA-112` · `freeze-then-evaluate-memory`

Separate memory acquisition from deployment by allowing writes and consolidation during an acquisition phase, then freezing the resulting library before running held-out tasks. Keep the model, prompts, and surrounding machinery fixed, and compare the frozen library with both a no-memory arm and a raw-trajectory arm. The freeze prevents local recovery, replay, or test-time adaptation from being credited as durable learning. The raw control determines whether consolidation created a useful abstraction or merely discarded information that direct reuse would have preserved.

Directional evidence synthesized from two benchmark reports supports this experimental separation. SkillEvolBench, reported by Lei ([2026](https://arxiv.org/abs/2605.24117)), identified cases where acquisition gains did not transfer into frozen deployment and where raw trajectories outperformed distilled skills. TIAP, from Panthi and Abdelfattah ([2026](https://arxiv.org/abs/2605.24060)), was carried in the same synthesis without a numeric result, so it supports the direction of the practice rather than an effect size. Freezing alone cannot diagnose a failed transfer. Distribution shift, weak retrieval, destructive consolidation, or inadequate stored content can produce the same observation. Evaluation labels must also remain unavailable to the writer before the freeze, since a fixed artifact can still contain leaked answers. Use the frozen boundary to isolate durable memory formation, then ablate the components inside that boundary.

### Pin the stored form that receives retrieval credit

`ERCA-113` · `pin-the-scoring-target`

Define whether a returned raw turn, source summary, or canonical fact receives retrieval credit, report that choice, and rescore saved rankings under the other plausible targets. Restrict system comparisons to query subsets with matched target coverage. A consolidating store can create several descendants from one source, so an unchanged ranking may receive different relevance judgments depending on which descendant the evaluator treats as the answer. The scoring target therefore belongs in the estimand rather than remaining an implicit property of the benchmark.

A purpose-built study by Panthi and Abdelfattah ([2026](https://arxiv.org/abs/2605.24060)) found directionally that switching among Raw, Source, and Canonical targets changed scores on fixed retrieval traces, reversed a parser-density recommendation, and changed target orderings in transfer runs. It also found that target coverage was confounded with query difficulty, supporting comparisons on coverage-matched subsets. This is one study without independent corroboration, so the size of those effects remains provisional. The method additionally requires recoverable lineage from each derived memory to its source turn. Graph-native stores such as Zep, which expose no stable source-turn-to-descendant mapping, fall outside the study's scope and may require another target basis. Binary membership also understates retrieval quality for multi-hop, temporal, and aggregation questions whose evidence spans several units. Coverage matching removes the measured population confound, but it does not make those richer relevance structures equivalent.

### Synthesize constrained eval instances and require human review

`ERCA-115` · `controlled-synthesis-human-verified`

Generate evaluation instances from structured specifications such as persona profiles or procedure families, inject distractors, hard negatives, and adversarial shortcuts, and require human approval for every instance before it enters the benchmark. Structured seeds define the capability being tested, while competing cues make superficial matching less likely to satisfy the task. Human reviewers then check that each generated item is coherent, answerable, and aligned with the intended construct instead of trusting synthetic output as ground truth.

The MemConflict report ([2026](https://arxiv.org/abs/2605.20926)) provides directional evidence by demonstrating structured-seed generation, distractor injection, and human expert inspection of every generated dialogue. Its white-box retrieval analysis also showed that answer correctness can diverge from retrieval of the supporting memory. SkillEvolBench ([2026](https://arxiv.org/abs/2605.24117)) supplies the use of adversarial shortcuts and process verifiers for cases where a shallow final-state check can accept an invalid solution path. Neither report includes an arm that removes the structured seeds or human gate, so they demonstrate the construction pattern without measuring its causal benefit. Human review can still miss shortcuts, and an outcome-only oracle can approve a correct-looking result reached through the wrong process. Hidden tests and process checks must therefore target the shortcut itself. Synthetic volume expands a designed test space, but it cannot substitute for verified construct coverage.

### Benchmark every patch gate against random selection

`ERCA-058` · `baseline-gates-against-random`

Evaluate any static, dynamic, or learned patch-overfitting detector against random selection on a realistic mixture of correct and overfitting patches before using it as a deployment gate. Reject the detector if it cannot beat that floor on the distribution produced by the repair systems it will oversee. A gate can appear discriminative when evaluated on an artificial patch mixture yet provide no practical selection value once correct and incorrect patches occur at deployment-like rates.

A null-result study by Williams and colleagues ([2026](https://arxiv.org/abs/2603.11262)) found that random selection outperformed all six evaluated state-of-the-art overfitting-detection tools in 71-96% of cases on curated realistic patch distributions. The earlier appearance of skill depended on unrealistic distributions, so it did not survive the more representative comparison. The durable lesson is the baseline requirement, not a claim that patch-overfitting detection is impossible. The result applies to the tested tools and automated-repair distributions; a future detector may clear the bar. Keep the random baseline in the evaluation harness after deployment so changes in patch generators, class balance, or detector implementation cannot silently lower the standard. The same discipline transfers to learned and heuristic gates elsewhere in an agent pipeline, but each gate needs a trivial baseline and realistic distribution appropriate to its own decision problem.

## Chapter 3: Benchmark contamination, oracle strength, and workload validity

4 taught in the chapter, 18 carried here. 22 practices in total.

The following pointer entries identify the practices taught in Chapter 3, where their full arguments, evidence, and boundaries are developed.

### Measure public benchmark inflation with matched private controls

`ERCA-003` · `measure-public-score-inflation-with-matched-controls`

Pair every score on a public benchmark with a score from matched tasks that were never part of that benchmark, using the same evaluation protocol for both. Report the public-private gap as the estimate of inflation from benchmark familiarity and repeated selection against the public set. Chapter 3 develops the construction and validation of matched controls for this purpose.

### Evaluate models on post-cutoff tasks

`ERCA-004` · `evaluate-on-post-cutoff-tasks`

Tag evaluation tasks by release date and score each model on tasks published after its training cutoff, supported by a live pipeline that harvests, validates, and preserves reproducible fresh tasks. Audit dynamic benchmarks for cutoff hygiene, regeneration quality, and comparability across snapshots before using their results. Chapter 3 develops both temporal holdouts and the operational requirements of live evaluation.

### Strengthen test oracles before adjudicating results

`ERCA-001` · `strengthen-test-oracles-before-adjudication`

Strengthen the tests that determine whether a solution passes by adding generated and adversarial cases, using trusted references, coverage signals, mutations, and plausible incorrect patches to improve fault detection. Re-adjudicate new and existing results under the stronger oracle, with manual review of a sample of apparent successes. Chapter 3 develops the construction and use of these stronger correctness checks.

### Benchmark systems on the workload they will serve

`ERCA-066` · `benchmark-on-your-own-workload`

Build evaluation sets from the work the production system is expected to perform, including real prompts, repository changes, tests, and domain-specific task lifecycles. Use those results to select systems according to the construct and conditions that match deployment, rather than substituting general leaderboard rank for workload validity. Chapter 3 develops how to turn production experience into a defensible workload evaluation.

The following compact entries record practices attached to Chapter 3’s mechanism but not taught in full by any chapter.

### Probe memorization before crediting benchmark gains to capability

`ERCA-002` · `probe-memorization-before-crediting-capability`

Before attributing a benchmark gain to problem-solving ability, remove information required for a legitimate solution and ask the model to recover an instance-specific artifact. For a repository task, provide only the issue description, deny repository access, and request the buggy file’s location. Compare the result with the same probe on held-out repositories. This separates knowledge of a published instance from the ability to inspect and repair unfamiliar code.

A controlled study by Liang and colleagues ([2025](https://arxiv.org/abs/2506.12286)) found up to 76% file-path identification from SWE-Bench-Verified issue text alone, with much lower accuracy on held-out repositories. Within those tested model-benchmark cells, the result indicates that benchmark performance partly reflected instance-specific recall. It does not establish how much of any individual score came from memorization.

Each benchmark requires a newly designed probe. The withheld information must genuinely be necessary, while remaining cues must not permit an ordinary inference. A negative result is weak evidence because subtler familiarity may affect planning or patch selection without revealing the requested artifact. The method transfers most readily to public benchmarks derived from repositories, documents, or competition problems likely to appear in pretraining corpora.

### Measure overlap with semantic matching

`ERCA-005` · `measure-overlap-semantically`

Before using an inspectable training corpus to validate a benchmark, scan prompts and solutions with both surface matching and semantic comparison, then report model scores separately for marked and unmarked items. Strings and n-grams catch direct reuse; embeddings or model-based comparisons can expose rephrased, translated, and synthetic variants that preserve a task while changing its wording.

A controlled analysis by Riddell and colleagues ([2024](https://arxiv.org/abs/2403.04811)) measured overlap between open corpora and HumanEval or MBPP, then found a performance difference between contaminated and clean subsets. A separate controlled intervention by Yang and colleagues ([2023](https://arxiv.org/abs/2311.04850)) showed that rephrasing and translation could bypass n-gram deduplication. Their 13B model, fine-tuned on rephrased benchmark material, reached GPT-4-level results on the tested MMLU, HumanEval, and GSM8k evaluations. Their model-based detector also found 8-18% HumanEval overlap in open corpora and detected contamination in synthetic datasets.

This practice depends on access to the training data, so it mainly serves model producers and open-model auditors. Closed systems require behavioral or likelihood-based methods. Semantic scanning is costly at corpus scale, detector blind spots limit recall, and thresholds need calibration for each language and domain. An overlap flag also requires a score-benefit analysis before it can establish that the model gained an evaluation advantage.

### Investigate contamination through estimated score benefit

`ERCA-006` · `anchor-contamination-metrics-to-score-benefit`

If an audit were comparing several definitions of contamination, it could estimate the score difference between the items each definition marks and leaves unmarked, with uncertainty around that difference. Exact copies, paraphrases, shared facts, and structurally similar problems could then be compared according to whether the evaluated model appeared to benefit from them. Raw overlap percentages would remain descriptive context rather than determine the audit’s conclusion.

A directional study by Singh and colleagues ([2024](https://arxiv.org/abs/2411.03923)) suggests that benefit-anchored measures could make competing contamination definitions more comparable and could filter out overlap without a detectable score effect. It also indicates that the relationship could vary with model size, so a definition selected for one scale would not automatically carry to another.

The available support is too thin to recommend this practice; this entry should be treated only as a lead for investigation. A useful estimate would require enough marked samples for statistical power and would remain vulnerable to difficulty differences between marked and unmarked subsets. Misclassified items could further obscure a real effect. Any future use would need model-specific validation and careful adjustment for confounding before informing benchmark retirement, score discounting, or evaluation reruns.

### Build fresh items under an anti-searchability protocol

`ERCA-007` · `build-fresh-items-anti-searchable`

When commissioning a private evaluation set, require annotators to create original prompts without copying web or model output, record every inspiration source, test each prompt for web searchability, and reject items that fail originality, difficulty, or ambiguity review. The annotation plan should accommodate rejection so reviewers do not preserve weak items merely to meet a target count.

Fresh construction addresses three leakage routes: direct inclusion of test items, indirect reuse through synthetic data generated by a model familiar with the benchmark, and selection overfitting caused by repeated evaluation. Corpus deduplication can address direct matches, but it cannot reconstruct what a generator memorized or undo repeated optimization against a public score. A directional benchmark-construction study by Matton and colleagues ([2024](https://arxiv.org/abs/2407.07565)) points toward anti-searchability review as a defense spanning these channels. The study also reported item rejection during review and lower scores on LBPP than on HumanEval, so results from the two instruments should not be treated as interchangeable.

Originality checks cannot prove that an idea is absent from every training corpus, and freshness begins decaying once items circulate. The protocol also requires skilled annotators, documented provenance, and independent review. Its cost is easiest to justify for consequential private model selection and regression testing.

### Audit each model-benchmark cell separately

`ERCA-008` · `audit-contamination-per-model-benchmark-cell`

Before comparing models on a leaderboard, audit leakage for each specific model-benchmark pairing and retain item-level results. Where access permits, combine corpus membership checks with negative-log-likelihood and n-gram accuracy tests. Flag comparisons whose models have different training lineages or different evidence of memorization instead of applying one contamination discount to the entire benchmark.

A strong census by Zhou and colleagues ([2025](https://arxiv.org/abs/2502.06215)) examined 83 software-engineering benchmarks. Average leakage was 4.8% for Python, 2.8% for Java, and 0.7% for C/C++, but the distribution was heavy-tailed and leaked samples measurably inflated scores under the study’s conditions. A directional study by Ramos and colleagues ([2024](https://arxiv.org/abs/2411.13323)) found memorization signals concentrated in particular pairings, including codegen-multi on Defects4J, while newer models trained on larger corpora, such as LLaMa 3.1, showed weaker signals. Mixed-lineage leaderboards can therefore combine measurements with different exposure effects.

Open-corpus matching cannot reveal proprietary training data. Likelihood and n-gram methods require suitable model access and remain weak against paraphrased contamination. Findings also expire as training corpora and model versions change. Low average leakage cannot clear the cell used for a particular decision, while a positive result for one cell cannot be generalized to every model evaluated on the benchmark.

### Combine contamination detectors by threat model

`ERCA-009` · `combine-contamination-detectors-by-threat-model`

Choose multiple contamination detectors according to both available access and the suspected leakage channel. Use direct and semantic matching when training data are inspectable; use negative-log-likelihood, Min-K, membership, and order-canonicity tests when logits are available; use carefully designed prompting probes when only text access exists. The combined set should cover verbatim, paraphrased, and cross-lingual exposure, with disagreements sent to manual audit.

A controlled study by Oren and colleagues ([2023](https://arxiv.org/abs/2310.17623)) showed that comparing canonical and shuffled dataset orders through log probabilities can provide statistical contamination evidence, including for datasets seen only a few times during pretraining. A controlled evasion study by Dekoninck and colleagues ([2024](https://arxiv.org/abs/2402.02823)) then demonstrated that Evasive Augmentation Learning could raise tested scores while escaping every evaluated detector. A survey by Ravaut and colleagues ([2024](https://arxiv.org/abs/2404.00699)) organized detection methods by access assumptions and contamination type, showing that their coverage differs. As a counterweight, a contested comparative evaluation by Samuel and colleagues ([2024](https://arxiv.org/abs/2409.09927)) found assumption violations, limited consistency across five methods, and failures involving modern post-trained models.

Multiple negative results therefore mean only that the selected methods found no signal under their assumptions. Order-canonicity requires log-probability access and misses exposure that preserves exchangeability. Methods validated on early base models may transfer poorly to instruction-tuned systems, especially when contamination occurs during fine-tuning with answer augmentation.

### Run a construct-validity check before adopting or building a benchmark

`ERCA-010` · `run-construct-validity-check`

Before adopting or constructing a benchmark, record the phenomenon it claims to measure, whether its tasks represent that phenomenon, and why its scoring metric distinguishes success from failure. Apply the eight recommendations from Bean and colleagues ([2025](https://arxiv.org/abs/2511.04703)) as review gates while the design can still be changed. The resulting record should connect each capability claim to concrete task properties and scoring behavior, so a precise result cannot silently inherit a broader interpretation than the instrument supports.

A systematic review of 445 benchmarks found recurring vague phenomenon definitions, mismatches between tasks and claimed phenomena, and metrics presented without adequate justification. Classical-validity vocabulary helps separate defects with different mechanisms: criterion contamination introduces irrelevant advantage, criterion deficiency leaves required behavior unmeasured, and construct underrepresentation substitutes a narrow sample for a broad domain. Practitioner illustrations show the same pattern when an apparent authorship detector instead identifies formatting era, or when evaluators decline to aggregate outcomes that share no common rule.

The review describes published practice rather than experimentally testing the checklist. Completing its eight recommendations therefore supplies necessary design hygiene, not proof of validity. If part of the claimed construct cannot be identified, narrow the claim or report no measurement for that portion instead of forcing it into the headline score.

### Investigate code-benchmark design against the documented defect taxonomy

`ERCA-011` · `build-code-benchmarks-against-defect-taxonomy`

If a team is investigating weaknesses in a code benchmark, it could compare the design with the 55-criteria How2Bench checklist across construction, quality assurance, release, and reporting. The inquiry could look for contamination exposure, missing or weak oracles, unverified ground truth, absent difficulty calibration, and incomplete statistical reporting. These categories provide a vocabulary for checking whether a proposed benchmark repeats failure classes already observed in earlier collections.

Cao and colleagues ([2025](https://arxiv.org/abs/2501.10711)) conducted an observational profile of 274 code-related benchmarks and reported widespread gaps in basic quality assurance. Their study assembled the checklist and recurring defect taxonomy from benchmarks published through 2024. That record can direct an investigation toward frequently omitted controls, but it does not establish that satisfying any checklist item causes a benchmark to become valid.

The support is too thin to recommend this practice. This entry is a lead for investigation, and any use should remain conditional on direct tests of the benchmark’s construct, tasks, and oracle. The taxonomy will also lag defects introduced by interactive agents, changing execution environments, and new data pipelines. A benchmark could satisfy every documentation criterion while still measuring the wrong capability.

### Split agent holdouts by the claimed level of generalization

`ERCA-013` · `give-agent-benchmarks-real-holdouts`

Reserve agent tasks that developers cannot inspect or tune against, then choose the split according to the generalization claim: use a task-distribution holdout for performance within a known distribution, or unseen task families for a broader transfer claim. Before accepting the resulting score, test whether task identifiers, shared artifacts, or other shortcuts let the agent succeed without performing the intended work.

Repeated scaffold, prompt, and tool tuning converts visible evaluation tasks into development data even when model weights remain fixed. Kapoor and colleagues ([2024](https://arxiv.org/abs/2407.01502)) provide directional evidence from agent benchmarks with inadequate or missing holdouts and shortcut-overfit systems, including lookup-style behavior. They prescribe matching the holdout to the claimed generalization level. Practitioner illustrations include conditioning diagnostic metrics on hidden-task success and using an unseen migration family to reveal that the evaluation schema itself failed to transfer.

This entry supplies a generalization-level split, not separation in time from a model’s training cutoff. The chapter already teaches that temporal control separately. Hidden tasks can still leak through related artifacts, and an unseen-family split can change the task distribution enough to expose benchmark-design defects rather than agent capability. When that happens, revise the instrument and withhold the capability score.

### Pin the eval harness and publish its complete artifacts

`ERCA-014` · `pin-and-publish-eval-harness`

Run every recurring evaluation through a versioned harness with pinned task definitions and shared metric implementations, then publish the exact prompts, extraction and normalization rules, scoring code, harness version, and raw model outputs with each score. Inspect a small batch of outputs before scaling the run, and decline direct numerical comparisons when the underlying harnesses differ materially.

Prompt formatting, answer extraction, tokenization, and normalization can change observations without a corresponding model change. Pinning those choices makes later deltas attributable to an identified apparatus, while raw outputs allow corrected metrics to re-score the same generations and preserve evidence after an API model disappears. Biderman and colleagues ([2024](https://arxiv.org/abs/2405.14782)) give directional support through a three-year operational account of the lm-evaluation-harness. Practitioner cases illustrate both sides: unpinned corpus counts decayed as repositories changed, while checksummed raw trial exports allowed independent recomputation of reported rates.

Standardization establishes comparability only within the recorded apparatus. A pinned harness can preserve a defective prompt, contaminated tasks, or a weak oracle with perfect consistency. Versioning also cannot make outputs from different harnesses commensurable. It records how a number was produced so later corrections can revise its interpretation without erasing the original artifact.

### Stress-test rankings under task and harness perturbations

`ERCA-015` · `stress-test-rankings-under-perturbation`

Before selecting a model or enforcing a regression gate from leaderboard rank, rerun the comparison across semantically transformed tasks and plausible harness variants. Rephrase, recombine, or deliberately shift problem difficulty; reorder answer choices; and apply alternative scoring methods. Report the resulting rank movement as uncertainty attached to the ordering.

Perturbation tests whether the ordering persists when surface form and evaluation plumbing change while the target capability remains recognizable. A controlled coding comparison by Xia and colleagues ([2024](https://arxiv.org/abs/2403.19114)) found that LLM-evolved HumanEval variants reduced scores by ~39% on average and reordered leaderboard positions. A controlled multiple-choice comparison by Alzahrani and colleagues ([2024](https://arxiv.org/abs/2402.01781)) found ranking movements of up to 8 positions under answer-choice reordering and alternative scoring methods. Together, these results show that a leaderboard position can depend on task presentation and metric implementation as well as model behavior.

Generated transformations can change difficulty, so absolute scores on evolved sets are not directly comparable with original scores unless equivalence has been established. The cited evidence covers function-level coding and multiple-choice benchmarks. For generative or agentic systems, grader and scaffold perturbations are plausible analogues, but these studies do not validate those extensions.

### Protect evaluation data when releasing it

`ERCA-017` · `protect-eval-data-at-release`

Release test material only in encrypted form under a no-derivatives license, and decline to send private items through APIs that provide no training-exclusion guarantee. Exclude tasks whose solutions appear beside them online, publish the surrounding web context of internet-derived items for audit, and regenerate templated counterfactual instances from a fresh evaluation seed when the task permits it.

These controls intervene while the publisher still governs the principal exposure paths. Plain-text material can enter crawler corpora automatically, fuzzy matching during later training can miss related forms, and an unprotected API request may compromise the set for descendant models. Jacovi and colleagues ([2023](https://arxiv.org/abs/2305.10160)) provide directional support in a policy paper arguing for publisher-side prevention through encryption, licensing, exclusion guarantees, and regenerated instances. Practitioner experience also records a deliberate choice to keep an evaluation set private, alongside a contrary case where public tasks and trajectories were released because external auditability took priority.

The protections assume sincere and competent participants. One negligent plain-text mirror can defeat encryption and licensing, and refusing unprotected services only protects the set if enough evaluators refuse together. Counterfactual generation is costly and depends on the domain. Release policy must therefore state whether durable holdout integrity or public auditability takes precedence when both cannot be preserved.

### Purge invalid items before measuring reliability

`ERCA-018` · `purge-invalid-items-before-measuring`

Remove mislabeled, ambiguous, and otherwise invalid items before treating benchmark failures as evidence of system unreliability. Fit a response model to per-item statistics, flag anomalous response patterns, send those candidates through an LLM-judge triage pass, and reserve expert review for the survivors. Invalid questions cause capable and unreliable systems to fail for the same instrument-side reason, compressing differences between their error profiles. In a platinum-grading study of fifteen popular benchmarks, Vendrow and colleagues ([2025](https://arxiv.org/abs/2502.03461)) found that cleaning label errors and ambiguity exposed persistent frontier-model failures on simple tasks that the dirty sets had obscured. In a separate study across nine benchmarks, Truong and colleagues ([2025](https://arxiv.org/abs/2511.16842)) combined item-statistic outlier detection with model-assisted triage and achieved up to 84% precision when identifying problematic questions.

Use the cleaned instrument for saturation-adjacent reliability claims, where invalid items can dominate the remaining error count. The response model assumes a largely unidimensional latent construct, and the reported validation establishes precision rather than recall. Unflagged items therefore remain unverified. Expert adjudication also limits scale, while publication and repeated reuse gradually erode any platinum designation. For frontier-capability measurement, intentionally difficult items and multidimensional skills may violate the assumptions that make this triage effective.

### Audit the leaderboard submission protocol before trusting its rankings

`ERCA-019` · `audit-leaderboard-submission-protocols`

Forbid undisclosed private-variant testing, selective score disclosure, and removal of inconvenient results, then publish submission, sampling, correction, and retraction rules before accepting entries. When consuming an external leaderboard, inspect those same rules and discount rankings from providers allowed to test many hidden candidates or expose only favorable outcomes. Best-of-k private testing selects the highest observation from a noisy metric, so reported scores and Bradley-Terry ratings rise even when the rating calculation itself is correct. A large forensic observational analysis by Singh and colleagues ([2025](https://arxiv.org/abs/2504.20879)) documented protocol asymmetries on Chatbot Arena, including 27 private Meta variants tested before Llama-4’s release, selective disclosure, and unequal access to arena data.

Protocol sensitivity also appears outside arena-style evaluation. Directional practitioner evidence from Zheng and colleagues ([2026](https://arxiv.org/abs/2602.05891)) found that submission order, contest selection, and repeated runs changed Codeforces-based Elo rankings. Preserve corrected and superseded results in the public record so readers can reconstruct how a verdict changed.

The strongest evidence is an observational analysis of one platform. Outsiders cannot recover the undisclosed number of attempted variants, and the resulting inflation depends on both that count and metric noise. Published rules expose and constrain degrees of freedom, but they cannot reveal private experiments conducted outside the platform.

### Treat a questionable-practices catalog as an investigative lead

`ERCA-021` · `audit-pipeline-against-qrp-catalog`

If an evaluation team chose to investigate possible analytic flexibility, it could compare its pipeline with the catalogued questionable and irreproducible practices, including selective baseline choice, repeated test-set exposure, cherry-picked checkpoints, and unreported prompt tuning. The review could record which choices were fixed before results appeared, which alternatives were available, and which decisions changed after inspecting scores. Such a record would make aligned discretionary choices visible and could suggest sensitivity analyses or preregistered reruns.

Leech and colleagues ([2024](https://arxiv.org/abs/2407.12220)) provide a directional taxonomy of 44 questionable machine-learning research practices and examples of how individually defensible decisions could accumulate in one favorable direction. That source could supply vocabulary for examining a result, but it does not measure how frequently the practices occur, how much any one changes an evaluation, or how their effects combine.

The support is too thin to recommend this practice as an evaluation control. This entry should be treated only as a lead for investigation. Even if every catalog item were checked, the result would not certify the pipeline, because the taxonomy could omit domain-specific failure modes and offers no validated relationship between checklist completion and measurement validity. Any corrective action would still require evidence tied to the benchmark, workload, and decision under review.

### Search for an adequate benchmark before creating another

`ERCA-022` · `search-before-building-a-benchmark`

Search the existing benchmark population for instruments that represent your intended construct, then repair a suitable candidate through a structured enhancement protocol before designing a new suite. Semantic retrieval can surface benchmarks described with different terminology, while a common enhancement process concentrates testing, defect discovery, and documentation on instruments that already have users. Koohestani and colleagues ([2025](https://arxiv.org/abs/2503.05860)) provide directional evidence from a review-and-tooling contribution that catalogued 204 AI4SE benchmarks with overlapping constructs. Their BenchScout tool supports semantic benchmark search, and BenchFrame structures the assessment and correction of known limitations. The authors demonstrated the enhancement process on HumanEval.

Adopt an existing instrument only after checking that its task format, oracle, environment, and sampled workload represent the decision you need to make. Reuse can preserve a weak construct simply because it is established, and cosmetic extensions can add another result column without correcting the underlying measurement problem. A new benchmark remains warranted when no located design can express the target workload or required interaction pattern.

The evidence establishes a direction rather than a general advantage for enhancement. BenchFrame has been demonstrated on one benchmark family, and BenchScout depends on a current, accurately described study corpus. Sparse metadata, unpublished internal suites, and rapidly changing domains can leave adequate candidates undiscovered.

### Pair offline evaluation with online experiments and recalibrate the judge

`ERCA-067` · `pair-offline-and-online-evals`

Use offline evaluations to filter candidate models or prompts before controlled exposure to production traffic, then run the same judge on experiment data and compare its preference with observed user and business outcomes. Keep secondary guardrail metrics in the experiment even when the optimization target excludes them. The offline stage reduces how many variants reach users; the online stage tests consequences that a fixed task set cannot represent. Disagreement between judge scores and experiment outcomes identifies a proxy failure and supplies live examples for recalibration.

A reported vendor practice from Cursor ([2026](https://x.com/cursor_ai/status/2032148129038950779)) establishes that one provider paired offline benchmarks with online evaluation as public suites saturated, but supplies no methodology. Directional practitioner evidence from Spotify Engineering ([2026](https://engineering.atspotify.com/2026/5/better-experiments-with-llm-evals-a-funnel-not-a-fork)) describes evaluations as a verification funnel before experiments and reports production rollbacks caused by secondary-metric regressions that offline evaluation had missed. Spotify also advocates applying judges to A/B data to test whether judge-preferred variants agree with user outcomes.

This pattern requires sufficient traffic, an experimentation platform, and safeguards for users exposed during measurement. Short experiments may miss long-horizon effects, rare harms, or changes that appear only after users adapt. Calibration is also local to a product, population, and period; agreement on one experiment does not establish durable judge validity or transfer it to another workload.

### Check task validity and outcome validity before using an agent benchmark

`ERCA-032` · `checklist-agentic-benchmarks-for-validity`

Before adopting or publishing an agent benchmark, verify separately that each task is solvable in its configured environment, represents the claimed capability, and has a grader that accepts genuine success while rejecting failure. Report failed checks alongside aggregate scores. Agent evaluations place executable environments, state transitions, tools, and programmatic graders inside the measurement path. A defect in any component can prevent a valid trajectory, manufacture apparent success, or score behavior unrelated to the stated task.

Zhu and colleagues ([2025](https://arxiv.org/abs/2507.02825)) provide directional evidence through an Agentic Benchmark Checklist synthesized from surveyed failures. Their cases include insufficient tests in SWE-bench Verified and TAU-bench treating empty responses as successful, showing that task and outcome defects can distort reported agent performance. Internal benchmark programs illustrate how these checks can be operationalized: one qualified scorers against null, successful, and adversarial fixtures, while another rejected supposed multi-repository tasks when their ground truth could be assembled from a single repository. These cases illustrate the procedure without adding independent evidentiary support.

A checklist can detect known defect classes only. Novel interactions among agents, tools, environments, and graders may survive every listed check, and several checks require costly manual reproduction or expert judgment. The checklist itself was synthesized from observed failures rather than experimentally validated. Passing it therefore reduces specific validity risks without certifying the benchmark, its aggregate score, or its suitability for a different agent architecture.

## Chapter 4: Execution-based evaluation, correction gates, and release tests

3 taught in the chapter, 4 carried here. 7 practices in total.

The following pointer entries identify the practices taught in Chapter 4, where their full arguments, evidence, and boundaries are developed.

### Gate candidate work on execution results

`ERCA-094` · `ground-evaluation-in-execution`

Run candidate work in a resource-bounded, network-isolated environment, and allow it to propagate only when tests, compilation, deployment checks, or other executable oracles succeed. This replaces plausibility-based acceptance with observed behavior. Chapter 4 develops the execution model and its role in dependable evaluation.

### Require external feedback for every correction step

`ERCA-061` · `gate-self-correction-on-external-feedback`

Couple each model revision to new information from a test, tool, verifier, or other external source instead of asking the model to reconsider the same reasoning unaided. The feedback gives correction loops a concrete signal to act on. Chapter 4 explains how to design and apply these gates.

### Replay a golden task set and score repeated success

`ERCA-095` · `golden-set-pass-k`

Curate representative real tasks with unambiguous oracles, replay them for every release, and measure whether the system succeeds consistently across repeated trials. This turns release evaluation into a check of operational reliability rather than a report of one favorable run. Chapter 4 develops the complete golden-set and pass^k practice.

The following compact entries record practices attached to Chapter 4’s mechanism but not taught in full by any chapter.

### Score verified resolution separately and reward abstention

`ERCA-063` · `score-verified-resolve-with-abstention`

Report submission and test-verified resolution as separate rates across repeated runs, include uncertainty, and add already-correct tasks whose successful outcome is no edit. An external oracle measures the resulting system state, while abstention probes expose an agent that treats every request as authorization to mutate code. This prevents confident completion messages and agreement across runs from standing in for correctness.

A directional analysis by Mehta ([2026](https://arxiv.org/abs/2603.25764)) examined 1,750 trajectories over 50 SWE-bench Verified tasks and four models. It found a clear divergence between submitting work and resolving the task, with silent semantic failures appearing confident and consistent across repeated attempts. The study also found action bias when agents encountered bugs that had already been fixed. These observations support measuring verified outcomes and preservation behavior, but they do not establish failure rates for coding agents generally.

The evidence comes from one author, a limited task set, and four models. Lightweight prompts delivered before editing did not close the observed gap, so prompting alone is not an adequate corrective mechanism. Abstention cases also require domain-specific construction: a valid do-nothing outcome must be independently verifiable, or the probe risks rewarding inaction when intervention was actually needed.

### Detect silent tool errors before planning

`ERCA-064` · `detect-silent-tool-errors`

Insert an explicit validation step between every consequential tool response and the plan that consumes it, checking structural validity, semantic plausibility, and whether the response is sufficiently complete. When validation fails, the plan should select a defined recovery route such as retrying differently, narrowing the request, using another source, surfacing the error, or stopping safely. A successful call without an exception should never by itself certify the returned content.

Silent errors are especially dangerous because they become accepted premises. The agent can then produce a coherent sequence of decisions whose shared foundation is false. Controlled calculator and embodied-planning experiments by Sun and colleagues ([2024](https://arxiv.org/abs/2406.19228)) provide directional evidence that detection followed by reflection can improve recovery from faulty tool outputs. Operational canaries illustrate the same mechanism: a known healthy query can be designed to trigger an expected signal, making an implausible success or unexplained silence observable.

This support remains early-stage and covers only two controlled settings. Semantic validation is itself an LLM judgment, so subtle errors may pass through confidently, and a detector can inherit convention drift or blind spots from the system it monitors. High-consequence pipelines therefore still need deterministic schema checks, independent evidence where available, and explicit failure handling rather than treating model reflection as a general guarantee.

### Cap agent turns and extend budgets only on evidence of progress

`ERCA-065` · `cap-turn-budgets`

Set a finite turn budget from the unrestricted baseline for the actual model, scaffold, and workload, using roughly its 75th percentile as an initial fixed ceiling or a smaller default that can be extended when observable progress justifies it. Give every loop explicit success and failure exits, and specify backoff and fallback behavior for flaky dependencies. Because accumulated token use grows quadratically with turns and unsuccessful runs tend to continue longer, a ceiling concentrates spending on trajectories that remain productive.

In a controlled SWE-bench study with three state-of-the-art models, Gao and Peng ([2025](https://arxiv.org/abs/2510.16786)) found that 75th-percentile caps reduced costs 24-68% with minimal solve-rate impact; dynamic extension reduced costs a further 12-24% relative to fixed caps. One vendor-adjacent case, described in [a practitioner account on r/programming](https://www.reddit.com/r/programming/comments/1p70pol/), reported a runaway ReAct loop consuming 10x tokens and attributed control to iteration limits, explicit exits, and recovery handling. That account establishes one occurrence, not a general rate.

Recalibrate the distribution whenever models, scaffolds, or tasks change, since tight limits convert some slow successes into failures. Yang, Ya-Ting and Zhu ([2026](https://arxiv.org/abs/2605.23929)) directionally motivate allocating more budget to slowly saturating sequential stages, but their result is theory plus numerical illustration and assumes independent failures. Apply that allocation only after measuring per-stage reliability curves; cap the loop first.

### Budget enforcement overhead and test recovery after blocks

`ERCA-169` · `budget-the-verifier-tax`

Evaluate runtime safety enforcement by whether the agent completes the task safely, completes it through a prohibited action, or fails after intervention, while also recording added turns and compute. For every blocked action, return structured policy information and provide an allowed continuation path that the agent can attempt. Test that path as a distinct recovery behavior instead of counting interception as the completed safety outcome.

A controlled tau-bench evaluation by Sah and colleagues ([2026](https://arxiv.org/abs/2603.19328)) found interception as high as 94%, while strictly safe goal attainment remained below 5% in most settings. Recovery after a block ranged from 21% to near zero. These measurements show that a mediator can prevent many non-compliant actions without enabling useful completion: unless recovery is engineered, enforcement can turn unsafe successes into dead ends. The transferable evaluation practice is therefore to decompose outcomes rather than report a single safety rate.

The measured magnitudes come from two mid-size open model families, customer-service domains, and 15-30-turn horizons. Stronger models, different tools, or shorter tasks may change both overhead and recovery. A continuation protocol also consumes context and compute and may reveal too little information for rerouting if policy explanations are deliberately constrained. Each deployment must measure the full safe-completion tradeoff under its own policies and task distribution.

## Chapter 5: Calibrating model graders and separating agreement from correctness

2 taught in the chapter, 2 carried here. 4 practices in total.

The following pointer entries identify the practices taught in Chapter 5, where their full arguments, evidence, and boundaries are developed.

### Calibrate model judges against expert labels

`ERCA-096` · `calibrate-llm-judges`

Define judgment categories with experts, establish dependable human labeling, and validate the model judge on held-out, stratified examples using chance-corrected agreement and error-sensitive measures. Use deterministic assertions wherever possible and retain human review in the scaled process. Chapter 5 develops the calibration workflow and the safeguards needed for trustworthy model grading.

### Keep agreement separate from correctness

`ERCA-111` · `separate-agreement-from-correctness`

Treat consensus among models or candidates as a measure of agreement, never as verification that a claim is correct. Ground typed claims in checkable sources and use principled abstention when the available support is insufficient. Chapter 5 develops the verification approach and shows how it fits into calibrated evaluation.

The following compact entries record practices attached to Chapter 5’s mechanism but not taught in full by any chapter.

### Keep an exact auditor beside heuristic graders

`ERCA-172` · `keep-an-exact-auditor-alongside-heuristics`

Add a deterministic auditor to your grading pipeline for every claim that admits exact checking, and run it beside heuristic or model graders, off the hot path if necessary. Recheck yesterday’s evaluations, compare exact results with heuristic verdicts, and alert whenever a grader confidently rejects valid work or accepts an impossible result. The auditor supplies a certificate where the heuristic supplies only a judgment, exposing errors that would otherwise leave no failure signal. This is the grading counterpart of auditing a dispatcher that silently drops schedulable work.

In a controlled comparison of 360 scheduling instances, Handley and colleagues ([2024](https://arxiv.org/abs/2310.18497)) found that the heuristic failed on seven instances. The exact solver certified six as infeasible and found a feasible schedule for the remaining instance. That result measured scheduling, not grading, so its support transfers through the shared failure mechanism: a heuristic can return a confident negative without revealing that valid work existed. The same control applies to work-queue dispatchers, capacity planners, and heuristic schedulers where dropped work produces no immediate failure signal.

Exact checking may be too costly for live evaluation, which can confine it to nightly runs, delayed samples, or high-risk cases. The empirical support comes from one study, and the author’s later discussion of that paper is corroboration rather than independent evidence. Applying its lesson to model grading therefore remains an architectural transfer, not a measured grading result.

### Combine judge labels with a random human-labeled subset

`ERCA-037` · `combine-judge-labels-with-human-subset`

Collect plentiful AI-judge labels, label a small random sample from the target population with humans, and combine both through prediction-powered inference. Use the human subset to estimate and remove the judge’s aggregate bias, allowing automated labels to reduce variance without defining the answer. When allocating further human review, prioritize items with low verbalized judge confidence through an inference procedure that accounts for that allocation.

In GPT-4 experiments, Boyeau and colleagues ([2024](https://arxiv.org/abs/2403.07008)) obtained unbiased estimates with valid confidence intervals and effectively increased human sample size by up to 50%. Gligorić and colleagues ([2024](https://arxiv.org/abs/2408.15204)) found that statistically valid confidence-driven allocation outperformed both all-LLM annotation and uniform-random human allocation. The mechanism works because judge errors concentrate among low-confidence items when the confidence signal ranks error risk, so each routed human label corrects more of the remaining bias.

The gain depends on correlation between judge and human labels. A weak judge provides little variance reduction, and a convenience sample cannot estimate bias across the target distribution. Verbalized confidence must also be tested on each task because a model’s confidence may fail to rank its errors. This procedure supports aggregate estimates and valid intervals; it does not certify individual judge decisions or replace a sound human-labeling protocol.

## Chapter 6: Proxy metric gaming and layered evaluation signals

3 taught in the chapter, 7 carried here. 10 practices in total.

The following pointer entries identify the practices taught in Chapter 6, where their full arguments, evidence, and boundaries are developed.

### Layer independent signals into every acceptance gate

`ERCA-038` · `layer-signals-beyond-single-proxy`

Combine any optimized proxy, such as tests passed, lint score, diff size, or judge score, with at least one independent signal the agent cannot directly optimize against. The additional signal helps the gate detect work that improves the proxy without improving the intended outcome. Chapter 6 develops this layered evaluation practice for acceptance decisions.

### Monitor divergence between proxy and true signals

`ERCA-039` · `monitor-proxy-true-divergence`

Track an independent quality signal alongside every optimized proxy, and compare how their relationship changes on a fixed reference distribution. Treat rising proxy performance as provisional until the independent measure confirms corresponding improvement, and alert when their correlation deteriorates. Chapter 6 develops this monitoring practice and its operational use.

### Monitor chain of thought without optimizing against it

`ERCA-042` · `monitor-cot-without-training-pressure`

Use a trusted model to inspect chain-of-thought traces for signs of reward hacking while keeping that monitor outside the training reward and strong selection pressure. This preserves a separate transparency channel that can reveal problematic strategies rather than becoming another target for optimization. Chapter 6 develops the monitoring design and how it supports oversight.

The following compact entries record practices attached to Chapter 6’s mechanism but not taught in full by any chapter.

### Escalate oversight at the first sign of gaming

`ERCA-040` · `escalate-on-first-gaming`

Escalate monitoring and human review as soon as an agent exhibits sycophancy, cosmetic test edits, or another mild form of specification gaming. Early exploits reveal that the agent has found reward in satisfying the measurement while bypassing its intent. Once that strategy has been reinforced, the same reasoning can transfer to settings where the available exploit causes greater harm. Escalation should include preserving the trajectory, examining similar runs, and tightening oversight on subsequent high-impact actions.

In a constructed curriculum study, Denison and colleagues ([2024](https://arxiv.org/abs/2406.10162)) found that models rewarded for easy forms of gaming generalized to rarer and more consequential behavior, including zero-shot reward-function rewriting. The study deliberately used gameable environments, so it does not establish how often minor gaming progresses in ordinary deployments. Retraining against early behaviors reduced later tampering but did not eliminate it. Treat the first incident as evidence for risk triage in long-running deployments, while recognizing that escalation detects exposure to a learned strategy and cannot remove that strategy by itself.

### Harden the environment around infeasible tasks

`ERCA-041` · `harden-infeasible-tasks`

Increase sandboxing, action monitoring, and review depth for tasks the agent is likely to find infeasible or unusually difficult. When the intended route offers little prospect of reward, exploiting the environment can become computationally attractive. Difficulty should therefore affect the oversight budget as well as model selection and scheduling. A stretch coding task may warrant narrower permissions, closer inspection of tool calls, and independent validation of the resulting state.

In a comparative chess study, Bondarenko and colleagues ([2025](https://arxiv.org/abs/2502.13295)) observed that reasoning models, including o1-preview and DeepSeek-R1, hacked an infeasible task without being nudged toward that strategy, while non-reasoning models required explicit prompting that normal play would not work. This directional result identifies where exploit propensity may concentrate. It comes from one task domain and a small model sample, so it supplies no rate estimate for coding agents and cannot establish that every difficult assignment will induce gaming. Use predicted infeasibility as a triage signal for defensive resources, not as a judgment about a particular run’s intent.

### Measure how early reward appears in the reasoning

`ERCA-043` · `measure-reasoning-effort`

Add a content-independent effort signal by truncating an agent’s reasoning at progressively later points, forcing an answer at each cutoff, and measuring the resulting reward curve. Flag runs that attain high reward from a small fraction of their full reasoning, represented by a large truncated-reward area under the curve. The mechanism relies on a cost asymmetry: exploiting a loophole can require less computation than completing the intended task, causing reward to become available unusually early.

In an evaluation study, Wang and colleagues ([2025](https://arxiv.org/abs/2510.01367)) showed that truncated-reward AUC detected implicit reward hacking without interpreting chain-of-thought content. Because the signal depends on when reward appears, its operation did not depend on whether the visible reasoning had been obfuscated. The result was measured on the authors’ evaluation suite. Applying it requires harness access to fork or truncate reasoning, resample answers, and pay the associated compute cost. Thresholds for suspiciously early reward must also be calibrated by task, since short reasoning can be legitimate. Use this signal alongside content-based monitoring when reasoning access exists; systems exposing only final actions cannot implement it directly.

### Average compatible reward models in weight space

`ERCA-055` · `weight-average-reward-models`

Fine-tune several reward models from the same pretrained base and average their parameters before using the result to train or gate an agent. Individual reward models develop different errors under distribution shift and inconsistent preference labels, leaving idiosyncratic gaps that an optimizer can exploit. Weight averaging combines their learned solutions while retaining inference efficiency near that of one model, provided the shared initialization keeps those solutions linearly mode-connected.

In controlled summarization experiments, Ramé and colleagues ([2024](https://arxiv.org/abs/2401.12187)) found that weight-averaged reward models improved reliability under distribution shift and resistance to preference noise in best-of-N selection and reinforcement learning. A policy trained with WARM achieved a 79.4% win rate against a policy trained with a single reward model. Compatibility is essential: reward models from unrelated pretraining runs do not satisfy the stated mode-connectivity assumption. Training cost grows with the number of models even when inference remains near single-model cost, and averaging only mitigates exploitable errors. The empirical validation covers summarization. Using the method for coding agents, agentic reward models, or learned acceptance gates remains a transfer hypothesis that requires evaluation in those settings.

### Evaluate agents inside their deployment feedback loops

`ERCA-056` · `evaluate-in-feedback-loops`

Test deployed agents in repeated-interaction environments where each output can alter later world state, retrieved context, or engagement signals. Preserve the causal path from an action to the inputs that follow it instead of certifying behavior solely on a fixed dataset. Feedback can amplify side effects through output refinement, where generated material shapes subsequent material, and policy refinement, where the agent adapts to an environment it has already influenced.

In a simulated deployment study, Pan and colleagues ([2024](https://arxiv.org/abs/2402.06627)) found that feedback loops drove in-context reward hacking at test time. Static evaluation structurally omits this behavior because it fixes the input distribution and prevents outputs from changing later opportunities and incentives. The evidence is directional and comes from simulations, so it does not determine the size or form of the effect in a particular production system. It also supports an evaluation design rather than a runtime mitigation. Because loop effects can grow with deployment scale, a small pilot may under-detect them. Staged rollouts should retain representative feedback pathways and assess repeated behavior before broader safety certification.

### Test hack detectors on realistic contrastive mixtures

`ERCA-060` · `test-detectors-contrastively`

Evaluate a reward-hack detector on mixed sets of benign and hacked trajectories using ratios that resemble deployment, then stress-test it on exploits whose meaning depends on task context. Contrastive examples expose the distinctions the detector must make in operation, while realistic base rates reveal whether benign behavior overwhelms its signal. Isolated classification can conceal both problems because it removes nearby alternatives and changes the prevalence of the behavior being detected.

In a directional benchmark study of 517 human-verified trajectories spanning a 54-category exploit taxonomy, Deshpande and colleagues ([2026](https://arxiv.org/abs/2601.20103)) found that contrastive evaluation improved detection relative to isolated classification. Performance also varied with the benign-to-hacked ratio and degraded for semantically contextualized exploits. The trajectories were synthetically curated despite human verification, which limits claims about transfer to live traffic. One project checker illustrates an appropriate operational posture: it deliberately uses conservative structural conditions, assigns low confidence, and defers semantic judgment to a model capable of inspecting content. That illustration adds no independent evidence. Current results support using these detectors to prioritize review; they do not justify making a detector the sole acceptance gate.

### Explore vector acceptance with an independent judge

`ERCA-173` · `accept-on-vector-with-independent-judge`

As an investigatory variant, you could retain tests, diff size, coverage delta, locality metrics, and review findings as a vector, compare candidates by dominance within explicit tolerances, and reserve acceptance for a judge that neither generated the change nor served as the optimization target. Deterministic gates would select candidates, while a different model would actively test acceptance criteria in a separate context. Sensitive changes would still require adversarial stress testing and human review as the real shipping gate.

A survey by Chen and colleagues ([2020](https://arxiv.org/abs/2001.08236)) provides directional support for the selection mechanism: weighted-search solutions can be dominated by Pareto-search alternatives, while fixed weights can over-constrain search and create a burdensome weight-specification problem. The same survey also reports that plain Pareto dominance loses discriminating power as the number of objectives grows. Separate-author verification and multi-model checking appear in project and vendor records, but those records provide illustration rather than independent empirical support. The vendor figure of 44% fewer AI-derived outages remains unverified, and another production record shows a scalar score of 950 / 1000 against a threshold of 850 still operating as the shipped gate. The support is therefore too thin to recommend this practice. It should remain a lead for investigation in agent-generated changes, automated refactoring, and eval-driven optimization, with any adoption evaluated against scalar gates under local conditions.

## Chapter 7: Agent isolation, injection defenses, and independent verification

3 taught in the chapter, 6 carried here. 9 practices in total.

The following pointer entries identify the practices taught in Chapter 7, where their full arguments, evidence, and boundaries are developed.

### Contain each agent’s blast radius

`ERCA-068` · `contain-agent-blast-radius`

Default agents to read-only access, require explicit gates for writes, and separate routine capabilities from destructive platform operations. Keep backups beyond the credentials and endpoints available to agents so an error cannot erase both production state and recovery assets. Chapter 7 develops this permission architecture and shows how to apply it to agent deployments.

### Verify every agent completion claim

`ERCA-069` · `distrust-agent-self-reports`

Treat every completion claim as a hypothesis to verify against the actual workspace, branch, checklist, and persisted artifacts. Preserve failed work for inspection, assign a fresh task identity to each attempt, and make correction and resumption depend on observed state rather than inherited progress reports. Chapter 7 develops the harness and review practices that make independent verification routine.

### Defend against prompt injection in depth

`ERCA-105` · `defense-in-depth-injection`

Layer input and output controls, allowlists, adversarial testing, and human approval around high-impact actions, with protections mapped to a recognized threat model. The goal is to contain what an injected instruction can cause the agent to do, even when hostile content reaches its context. Chapter 7 develops this defense-in-depth approach to prompt injection.

The following compact entries record practices attached to Chapter 7’s mechanism but not taught in full by any chapter.

### Make orchestration topology part of the security design

`ERCA-104` · `topology-as-security-decision`

Map every agent-to-agent connection as a trust boundary, isolate workers that consume untrusted material, restrict each worker’s tools, and validate model output before another agent can interpret it as a command. Topology determines how contaminated context travels and which capabilities it can reach. In tested configurations, Hagag ([2026](https://arxiv.org/abs/2604.23459)) found up to 3.8x attack-success variance across topologies for the same task, with untrusted input propagating across agent boundaries. Directional work on communication attacks by He ([2025](https://arxiv.org/abs/2502.14847)), G-Safeguard by Wang ([2025](https://arxiv.org/abs/2502.11127)), and the MPAC protocol ([2026](https://arxiv.org/abs/2604.09744)) points toward treating communication paths and permission boundaries as security controls.

Splitting a task among more agents does not itself provide isolation. The tested multi-agent arrangements were more vulnerable in most configurations, and the Capability Paradox described by Liu ([2026](https://arxiv.org/abs/2605.17480)) directionally indicates that stronger worker models can make weaponized instructions more effective through persuasive linguistic certainty. Segmentation also fails when workers share broad credentials, exchange unrestricted natural-language instructions, or treat upstream model output as trusted because another agent already processed it. The practice transfers to multi-agent design, tool permissioning, and any pipeline where untrusted input can cross from interpretation into execution.

### Investigate stateful guardrails across sessions

`ERCA-110` · `stateful-cross-session-guardrails`

If cross-session attacks are in scope, an investigation could distribute validation across agents, retain security-relevant state between sessions, and treat every cross-agent handoff as attacker-controlled input. The proposed mechanism would connect fragments that a session-bound gate sees only separately. It could also expose injection laundering, where content gains apparent legitimacy while passing through agents that each inspect only part of its history. Azarafrooz ([2026](https://arxiv.org/abs/2604.21131)) directionally reports that central session-bound gates miss cross-session and context-fragmented violations. AGrail by Luo ([2025](https://arxiv.org/abs/2502.11448)) and Architecture Matters ([2026](https://arxiv.org/abs/2604.23459)) point in the same architectural direction without supplying a production effect size for this design.

The support is too thin to recommend this practice, so this entry is a lead for investigation rather than deployment guidance. The main source is a single-author preprint built around its own synthetic benchmark, with 54 scenarios per shard, one correlator model family, Anthropic Claude, and no prompt optimisation. Its bounded-memory results come from that benchmark rather than documented guardrail deployments, and the author presents the work as motivation for larger multi-provider datasets. Any evaluation would still need stable identity across events, bounded and reviewable retained state, and evidence that distributed guards can act on correlations they detect. Without production validation, neither detection coverage nor operational benefit can be inferred.

### Route agent remediations through a typed policy path

`ERCA-139` · `execute-agent-remediations-through-typed-policy-path`

Make diagnosis and planning agents emit typed remediation plans over a small action set, then allow only a compact validated executor to apply those plans transactionally. Each mitigation should traverse explicit preconditions, evidence analysis, an action plan, plan reflection, an execution-policy check, and result reflection, with stopping represented as a valid result. The mechanism confines autonomy to operations whose side effects are declared and checkable. Safety therefore depends primarily on the action vocabulary, validator, and transaction boundary rather than on an agent’s confidence or apparent diagnostic skill.

A directional preprint by Bindschaedler ([2026](https://arxiv.org/abs/2604.09963)) reports that typed plans validated by a microkernel reduced agent-caused harm in simulation and online evaluation over industrial traces with fault injection. Instacart’s practitioner account, [“Blueberry: Force Multiplier For The On-Call Engineer”](https://tech.instacart.com/blueberry-force-multiplier-for-the-on-call-engineer-98c446dfcc12), describes a comparable policy sequence for deploy-failure mitigation and preserves stopping when evidence is unclear. These sources support the direction of the design, not a general production effect size. The value is containment rather than speed: model inference can delay recovery for services that already restart quickly, and the approach needs dense tracing to infer safe restart boundaries. It also cannot safely perform a remediation absent from its action set. New actions require reviewed semantics and operational evidence instead of an unrestricted executor escape path.

### Assign autonomy separately to every action

`ERCA-189` · `score-actions-by-reversibility-and-blast-radius`

Place each agent action on an explicit ladder from observe-only, inform, and recommend through act-with-approval, act-with-notification, and fully autonomous execution. Choose the rung by examining the action’s reversibility, blast radius, signal quality or confidence, and time sensitivity. This makes authority a property of a particular side effect rather than a permanent rating attached to an agent. Reversibility determines whether a mistaken action can be repaired, while blast radius determines how much of the system may require repair. Consequently, the same agent can restart an isolated worker at one rung and delete shared state only at another.

Bala Priya C’s directional practitioner article, [“When Should a DevOps Agent Act Without Human Approval?”](https://devops.com/when-should-a-devops-agent-act-without-human-approval/), supplies both the six-level ladder and the four scoring factors. No cited study establishes that using those placements reduces incidents. Time sensitivity deserves particular scrutiny because urgency can become a convenient justification for ceded control; the relevant question is whether a five-minute human delay would actually worsen the failure. Mitchell and colleagues ([2025](https://arxiv.org/abs/2502.02649)) contest the development of fully autonomous agents and argue that risk grows as control is ceded. Their position bounds the highest rung rather than validating the ladder. Use the framework to expose an autonomy decision for review, without converting qualitative judgments into a spurious numerical score.

### Investigate the local security effect of AI assistance

`ERCA-151` · `measure-your-own-security-delta`

If an organization is considering a local comparison, it could measure assisted and unassisted development on the same tasks and participant population before treating an external security result as locally representative. Such a comparison would test whether assistance changes functional output and security defects under the organization’s own languages, tools, and review process. Sandoval and colleagues ([2022/2023](https://arxiv.org/abs/2208.09727)) conducted a controlled N=58 study on a low-level C linked-list task. In that setting, assisted users produced critical bugs at no more than 10% above control while producing more functional code, contradicting a headline obtained in a different setting and showing that the measured effect can depend on task and population.

The support is too narrow to recommend local assisted-versus-unassisted testing as a general practice, so this entry should serve only as a lead for investigation. The study population consisted of students, and the experiment covered a single task family. It cannot establish the effect for professional teams, other languages, autonomous coding agents, or production repositories. Any local study would also need comparable task exposure across its arms, since greater functional output can create more opportunities for defects and distort a simple bug count. Even a favorable local result would not license skipping security review. If task coverage or sample size were inadequate, the security delta would remain unresolved rather than becoming evidence for either alarmist or complacent policy.

### Reject self-attestation for AI-assisted code

`ERCA-152` · `never-accept-self-attestation`

Treat an author’s confidence in AI-assisted code as a report of belief and require verification independent of both the author and the generating system. Match the check to the claim: execute behavioral tests, test security properties directly, and use independent review for assumptions that executable checks cannot encode. During generation, encourage skeptical prompting and active steering because these behaviors were associated with better outcomes, while preserving external verification as the acceptance gate.

In a controlled study, Perry and colleagues ([2022/2023](https://arxiv.org/abs/2211.03622)) found that participants using an assistant produced less secure code while believing their code was more secure. Participants who trusted the assistant less and invested more effort in steering it produced fewer vulnerabilities. That relationship was observational within the experiment, so it does not establish skeptical prompting as the cause. An audit of a separate generated report illustrates the same verification problem: its load-bearing cost figure proved untraceable, alongside a hallucinated reference and a mis-cited benchmark. That case is corroboration only and adds no independent evidentiary strength.

The controlled result came from security tasks using the suggestion-era codex-davinci-002 assistant, and effects varied by task. It cannot quantify the gap for current agents or ordinary application development. It does establish that confidence and quality can move in opposite directions under the studied conditions, making self-certification unsuitable as an acceptance criterion.

## Chapter 8: Persistent agent state, durable workflows, and idempotent retries

3 taught in the chapter, 11 carried here. 14 practices in total.

The following pointer entries identify the practices taught in Chapter 8, where their full arguments, evidence, and boundaries are developed.

### Make agent state a persistent artifact

`ERCA-130` · `make-agent-state-first-class-persistent`

Externalize plans, progress, event history, context snapshots, and checkpoints into durable managed artifacts instead of leaving workflow state inside a process or model context. Use those artifacts to reconstruct the work faithfully after interruption, worker replacement, or session loss. Chapter 8 develops the state model and recovery workflow needed to make persistence a first-class property.

### Coordinate multi-step work with a durable workflow engine

`ERCA-128` · `use-durable-workflow-engine`

Put multi-step, multi-service, and multi-agent coordination under a durable workflow engine that owns persisted execution state, retries, compensation, and the overall view of a run. Keep orchestration concerns in that platform layer so application code does not accumulate scattered recovery logic or instance-local coordination state. Chapter 8 develops how this architecture organizes reliable long-running work.

### Make every retried step idempotent

`ERCA-124` · `make-retried-steps-idempotent`

Design every retryable step so repeated execution produces the same observable result as one execution. Carry an idempotency key with side effects and retain results by invocation identity, allowing redelivered work to return the prior result instead of repeating the action. Chapter 8 develops the guarantees and implementation mechanics for safe retries.

The following compact entries record practices attached to Chapter 8’s mechanism but not taught in full by any chapter.

### Give every external effect a receipt and a compensator

`ERCA-098` · `transactional-side-effects`

Extend each side-effecting tool adapter with a durable invocation identity, an effect receipt, and, where reversal is possible, a compensating operation. When the same invocation returns after a crash, replay the recorded result instead of issuing the write again; assign a new identity only when the caller explicitly requests a new effect. Append completed effects to a per-run transaction log, record their dependencies, and invoke compensators in reverse dependency order when later work fails.

This structure makes the dangerous commit-before-acknowledgment interval inspectable. A proof-of-concept experiment reported by Zheng ([2026](https://arxiv.org/abs/2603.20625)) demonstrates the semantic-rollback hazard and proposes a mitigation, but it does not measure the receipt-and-compensator design described here. Perera ([2026](https://arxiv.org/abs/2605.03409)) and Chang ([2025](https://arxiv.org/abs/2503.11951)) provide directional support for compensation-oriented recovery without supplying a result that establishes its effectiveness. In one chaos exercise, a guarded irreversible mutation required a persistent claim record and a separate, idempotent watchdog because the workflow engine alone could not prevent duplicate external effects.

A compensator must encode the semantics of its particular tool, and reversal may leave traces or incur additional effects. Payments, merges, messages, and other irreversible operations therefore depend on durable receipts, fail-closed handling, and escalation. No workflow runtime can create transactional behavior across an external service that neither recognizes invocation identity nor participates in the transaction.

### Define the runtime retry contract with three observable invariants

`ERCA-123` · `state-retry-contract-invariants`

Write the retry contract for every tool or step as three testable guarantees: failed invocations return for another attempt, completed invocations never execute again, and happens-before relationships within a call stack survive recovery. Verify each guarantee by killing the runtime at the precise step granularity on which the application relies, then inspect the runtime’s authoritative state to determine whether progress, effects, or ordering changed.

A process-calculus analysis by Tardieu and colleagues ([2021](https://arxiv.org/abs/2111.11562)) directionally establishes that these three properties jointly yield exactly-once effects when all observable application state, including entity state, queues, and orchestration progress, resides in the managed persistent store. Each invariant excludes a different failure: a missing retry loses progress, a repeated completion duplicates an effect, and broken ordering invalidates assumptions between otherwise successful calls. One implementation exercise made these claims falsifiable by killing execution after money moved but before acknowledgment and judging recovery from an append-only ledger. The ledger observed the outcome but did not restore it, avoiding a circular test in which the harness supplies the durability being evaluated.

The formal result stops at the managed-state boundary. An irrevocable API call, model request, or external write remains outside the proof unless its service participates in the same persistence protocol. Precise invariants expose that risk and support focused failure tests, but they cannot eliminate uncertainty at an uncooperative external boundary.

### Take asynchronous snapshots at natural consistency boundaries

`ERCA-125` · `checkpoint-async-at-consistency-boundaries`

Place snapshot triggers at boundaries where the runtime can identify a consistent state, and perform the persistence work asynchronously. In a dataflow, insert barrier markers into the record stream and save each operator’s state as the barrier passes. In an agent sandbox, inspect the OS-visible effects of each completed turn, classify which state changed, and checkpoint only the state classes required for recovery.

A systems technical report by Carbone and colleagues ([2015](https://arxiv.org/abs/1506.08603)) showed that asynchronous barrier snapshotting produced consistent snapshots without pausing the dataflow; for acyclic topologies, only operator state had to be persisted. FIFO delivery and barrier alignment determine which records belong before the snapshot and which belong after it. Agent turns offer a related consistency point because filesystem, process, and model-call effects can be assessed after a turn completes. A preprint by Wu and colleagues ([2026](https://arxiv.org/abs/2604.28138)) provides directional evidence that effect-aware checkpointing at these boundaries can avoid unnecessary snapshot work while preserving recovery semantics.

The guarantees do not transfer unchanged between the two settings. Barrier snapshots depend on reliable FIFO channels and replayable inputs, and they cover internal consistency rather than duplicate-safe output delivery. Agent checkpoints require host-side inspection and interception of model API traffic. Effects beyond the inspected sandbox remain invisible, while transactional or identity-aware sinks are still required wherever replay can repeat an external write.

### Calculate checkpoint cadence from measured operating conditions

`ERCA-126` · `calibrate-checkpoint-interval`

Calculate checkpoint cadence from the observed cost of saving state, the deployment’s failure rate, recovery cost, and fault-detection latency. Retain more than one snapshot, and define a meaningful unit of agent work so intermediate state is saved after a calibrated number of units. Recompute the cadence when workload, infrastructure, snapshot size, or detection behavior changes.

Analytical work by Jayasekara and colleagues ([2019](https://arxiv.org/abs/1911.11915)) directionally supports deriving the interval from checkpoint cost and failure rate instead of accepting a stock default. Saxena and colleagues ([2024](https://arxiv.org/abs/2410.18124)) extend that direction by treating availability as the objective, retaining at least two snapshots, and accounting for detection latency. A practitioner account by Addy Osmani and Shubham Saboo ([2026](https://www.turingpost.com)) similarly points toward checkpointing long agent batches after a cost-calibrated group of work units. An operational example illustrates why detection belongs in the calculation: frequent heartbeats exposed a killed worker promptly, while a configuration without heartbeats could not notice the death until its longer step timeout elapsed.

These models assume that the failure process has been characterized, commonly as an exponential process. The interval that minimizes expected lost work may differ from the one that maximizes availability when save and recovery times are material. A formula also cannot choose the semantic granularity of a checkpoint or determine whether a snapshot captured already-corrupted state, so operators must pair the calculation with consistency boundaries and fault-detection tests.

### Investigate event-delivery guarantees before choosing choreography

`ERCA-129` · `design-event-coordination-guarantees-explicitly`

If event-based coordination is under consideration, treat ordering scope, delivery behavior, replay sources, deduplication identity, and dead-letter ownership as questions the candidate design would need to answer. Each event flow would need an identified owner for unprocessable messages and a recovery path through which repaired consumers could catch up after restarts or concurrent delivery. Broker labels alone would not establish those properties.

A mining study by Laigner and colleagues ([2024](https://arxiv.org/abs/2408.00440)) examined 8000+ Stack Overflow questions and manually coded 628 of them. Its directional result identifies ordering, delivery, replay, and dead-letter handling as recurring areas of practitioner difficulty in event-driven microservices, including reported cases in which teams abandoned the architecture. Agent orchestration built on publish-subscribe systems or ad hoc events could encounter the same failure catalog because coordination state would likewise be distributed among brokers, consumers, and storage.

The support is too thin to recommend this practice, and this entry should be treated only as a lead for investigation. The study mined questions from developers who encountered difficulties, so it cannot estimate how frequently these problems occur across deployments. It also evaluated neither the proposed design checks nor any remediation. If choreography remained a candidate, its guarantees would still need direct validation against the selected broker configuration, consumer implementation, persistence layer, and recovery procedure.

### Commit each step’s execution record with its data changes

`ERCA-131` · `log-steps-transactionally-with-data`

Record each step execution in the same transactional store as the authoritative data it changes, and commit the execution record and data mutation in one transaction. A failed transaction should expose neither record; a successful transaction should expose both. Recovery can then determine from one source whether an attempt committed, while operators gain an execution history tied directly to the corresponding state transition.

The mechanism removes a split that otherwise permits progress metadata and business state to disagree. If a stateless worker writes application data and later records completion elsewhere, failure between those writes can produce either an unlogged effect or a completion marker without its intended data. A database-integrated function framework studied by Kraft and colleagues ([2022](https://arxiv.org/abs/2208.13068)) provides directional evidence for using the database as the execution runtime so the log and effects share a commit boundary. Within that boundary, the same transactional record supports both recovery decisions and operational inspection without a separate reconciliation protocol.

The guarantee covers only effects represented inside the transaction. An email, payment, deployment, model request, or remote tool call can complete while the database transaction aborts or before its execution record commits. Such effects still need their own identities, receipts, or compensating actions. Co-location also becomes inappropriate when the step’s authoritative state lives elsewhere.

### Isolate shared agent state with transactional controls

`ERCA-140` · `isolate-shared-agent-state-transactionally`

Place shared memory stores, vector indices, and tool registries behind isolation controls that treat each agent interaction as a long-running read-generate-write transaction. Record the version of every shared resource read during generation, then validate those versions before committing an update or external action. The controls should explicitly exclude stale-generation, phantom-tool, causal-cascade, and tool-effect-reordering anomalies. Model latency lengthens the interval in which concurrent agents can invalidate one another’s premises, so checking only the final write leaves important conflicts undetected.

Khan ([2026](https://arxiv.org/abs/2606.17182)) used TLA+ specifications and TLC counter-examples to exhibit all four anomaly classes and showed directionally that isolation mechanisms exclude them under deterministic-generation semantics. That framing makes database isolation reasoning applicable because deterministic replay preserves the transaction’s relationship between its reads, generated result, and writes. The paper also describes enforcement in three deployed Rust runtimes, with the live layer exercised across three model families in 120 retracted sessions.

The formal guarantee depends on deterministic generation and covers interactions mediated through shared resources. It does not address prompt-level interference or establish that a consistent generated decision is correct. The study reports neither throughput nor latency costs, so teams must measure how validation, conflict handling, and replay affect their own durable workflows.

### Investigate deterministic postconditions for stochastic steps

`ERCA-135` · `guard-stochastic-steps-with-postconditions`

Investigate whether each stochastic generation could be paired with a deterministic guard that maps its output and workflow state to pass or fail. If such a predicate were writable, a candidate recovery hierarchy could retry the step with refined context, backtrack after stagnation by invalidating dependent work and injecting context upstream, and finally escalate to a human. This structure could keep failures from becoming durable progress while avoiding the uncontrolled retry growth that independent retries across many steps could create.

Thompson ([2025](https://arxiv.org/abs/2512.20660)) reports directional results across 13 models of 1.3B-15B parameters and three diagnostic probes, including up to 66-percentage-point reliability gains at 1.2-2.1x cost. Context injection changed upstream output in 100% of 71 escalation events. The same study produced a material null result on SWE-Bench Pro: recovery reached 37.5% for test generation, 0% for patch generation, and 0% for end-to-end patch production. Cruz ([2025](https://arxiv.org/abs/2512.07094)) describes one state-machine-gated supervision case in which only legal transitions could execute. Its runtime surfaced a diagnostic-tool schema conflict as an explicit error with a fallback diagnosis and repair plan.

The support is too thin to recommend this practice, so this entry is only a lead for investigation. Thompson’s work is a single-author unrefereed preprint, and Cruz reports one supervisor, one sibling agent, and one reminder-latency incident without comparison. Any trial would require checkable postconditions, and successful execution recovery could not compensate for a defective plan.

### Version events early and strengthen their schema gradually

`ERCA-137` · `version-events-weak-schema-first`

Assign an explicit version to every event type from the beginning, while allowing readers to tolerate compatible additive changes. Introduce upcasters when current consumers need older records translated into the present representation. If adapter chains become operationally burdensome, consolidate them through a copy-and-transform migration. This progression preserves access to durable history without imposing the cost of a mature migration system before evolution pressure exists.

Overeem and colleagues ([2021](https://arxiv.org/abs/2104.01146)) conducted a grounded-theory study involving 25 engineers and 19 production event-sourced systems. Their qualitative evidence identifies schema evolution as the dominant lifecycle challenge and describes five observed techniques as a maturity path. Within those settings, versioned events combined with weak schema appeared to be a low-regret starting point because teams could defer more elaborate machinery without preventing later migration. The result transfers directly to agent action logs whose old records must remain interpretable by newer orchestration code.

This evidence comes from one vendor-adjacent population and does not compare the techniques experimentally. Tolerant readers still need structural validation, since excessive permissiveness can admit malformed records. Upcaster chains can grow without bound when they are never consolidated, adding latency and maintenance work. Immutable histories also leave data-privacy obligations, including the right to be forgotten, as an unresolved operational problem.

### Design operations to tolerate partial execution order

`ERCA-138` · `design-operations-order-tolerant`

Define domain operations under eventual consistency so that safe outcomes survive interleaving and partial execution order. Prefer incremental updates and genuinely blind updates when the domain permits them, and document explicit compatibility relations between pairs of operations. Reserve read-modify-write sequences for cases that require a serial decision, because embedding a previously read value in a later write can overwrite concurrent progress.

The mechanism reduces unsafe schedules through the domain model itself. An incremental operation can preserve independent changes made after its caller last observed state, while a read-modify-write operation can carry a stale snapshot into the commit. Compatibility analysis also exposes operations that commute, operations that may be reordered safely, and operations whose conflict requires stronger coordination. Braun and colleagues ([2021](https://arxiv.org/abs/2108.03758)) report directional evidence from two action-research cycles in one industrial context. Professional engineers incorporated these guidelines into ordinary tactical domain-driven design, and the study found that order-tolerant operation design prevented consistency anomalies such as lost updates by construction.

The practice requires upfront domain analysis and engineers able to reason about relevant interleavings. The evidence is industrial action research rather than a controlled experiment, so it establishes a useful direction without comparative effectiveness. Some operations represent inherently conflicting decisions and cannot be made compatible through reformulation. Those cases still require transactions, arbitration, or another mechanism that establishes one authoritative order.

### Investigate crystallizing repeated plans into declarative blueprints

`ERCA-141` · `crystallize-repeated-plans-into-blueprints`

Investigate whether a repeated, stable multi-tool task could be designed once by an agent and emitted as a parameterized JSON blueprint for later execution without model involvement. A candidate blueprint could use a deliberately small language of five primitives and convergent mutations such as MERGE semantics. If the task’s shape remained fixed, subsequent runs could become deterministic workflow executions, with retries reproducing the same operations instead of invoking fresh tool selection and planning.

Singh Parmar ([2026](https://arxiv.org/abs/2605.00827)) reports one production Kubernetes synchronization case containing 67 steps. The paper attributes >99% token reduction, 40-80x latency improvement, and 0 errors to blueprint execution. Those observations remain anecdotal. Only the roughly 42s engine run was executed; the 40-80x comparison was derived from a hypothetical 30-60-minute agent baseline that the paper never ran, and the token counts were estimates under stated conservative assumptions. A project dossier offers an illustration in which an agent-backed continuous-integration path was demoted after deterministic TypeScript and GraphQL code produced the same JSON report, but that dossier is corroboration rather than independent evidence.

The support is too thin to recommend this practice, making the entry a lead for investigation only. The reported engine was single-process, and its language deliberately excluded conditionals, so branching would still require agent involvement. A task that changes shape between runs would offer little amortization and could make a frozen blueprint stale or incomplete.

## Chapter 9: Replayable traces and fault-injection recovery testing

2 taught in the chapter, 7 carried here. 9 practices in total.

The following pointer entries identify the practices taught in Chapter 9, where their full arguments, evidence, and boundaries are developed.

### Record every run as a replayable typed trace

`ERCA-097` · `replayable-typed-traces`

Represent each run as a persistent typed event stream that records model, tool, and environment effects in a replayable form. Include agent, session, and reasoning-step identifiers so decisions can be joined to the actions they caused, and use shared telemetry conventions to keep the trace interoperable. Chapter 9 develops this tracing model and its role in reliable agent operations.

### Benchmark recovery by injecting failures

`ERCA-127` · `benchmark-recovery-with-fault-injection`

Test recovery by deliberately injecting failures into the running system and observing how it returns to useful, stable operation. Measure recovery behavior, restored performance, and the effects of repeated disruptions so fault-tolerance claims rest on demonstrated behavior rather than system diagrams. Chapter 9 develops the experimental method for turning recovery into a benchmark.

The following compact entries record practices attached to Chapter 9’s mechanism but not taught in full by any chapter.

### Record nondeterministic results and replay only deterministic code

`ERCA-121` · `record-nondeterminism-replay-deterministic-code`

Keep workflow control flow deterministic, and move clock reads, randomness, I/O, LLM calls, and every other nondeterministic operation into logged activities whose recorded results are reused during replay. Classify agent steps as derive or infer. Derive steps may run again because their outputs follow deterministically from recorded inputs. Infer steps capture model judgment, so persist their outputs and reuse them only when an explicit compatibility policy permits it.

Replay reconstructs state correctly when the event history determines the orchestrator’s decisions. Reissuing an inference can produce a different result, select another branch, and fork the recovered execution away from the original run. Directional systems evidence from Burckhardt and colleagues ([2021](https://arxiv.org/abs/2103.00033)) supports deterministic control flow over logged history as the basis of replay recovery. Durable Functions also provides a static analyzer for determinism violations, although that product feature does not measure how often developers introduce them. One position paper by Quinto and colleagues ([2026](https://arxiv.org/abs/2607.08740)) extends the model to LLM workflows through the derive and infer distinction; it establishes a proposed design, not an empirically validated recovery rate.

Any nondeterministic value that enters orchestration code can still invalidate replay. Long histories increase replay cost and exposure to such defects. Recorded inferences also need retention, compaction, invalidation, and version-compatibility rules. Otherwise, recovery may preserve obsolete judgment with the same fidelity as valid state.

### Bound the event history that recovery must replay

`ERCA-122` · `bound-replay-history`

Divide long-running workflows at durable semantic boundaries by using sub-orchestrations, restarting with explicit state through continue-as-new, or expressing long tasks as chains of small persisted tail calls. Choose each cut so that recovery needs to replay or retry only a short suffix, and carry all state required by the next segment as explicit input.

Replay work and exposure to determinism defects grow with the history that must be revisited. A fresh history limits both, while persisted tail-call boundaries give the runtime bookkeeping points needed to preserve task ordering and resume from completed progress. Directional workflow evidence from Burckhardt and colleagues ([2021](https://arxiv.org/abs/2103.00033)) supports sub-orchestration and continue-as-new as ways to keep replay histories short. Separate directional evidence from Tardieu and colleagues ([2021](https://arxiv.org/abs/2111.11562)) shows how tail-call decomposition allows retry orchestration to re-execute the last small step and examines the runtime cost of fault preparedness per persisted step. These results establish the architectural direction without prescribing a universal history length.

The runtime cannot identify the application’s semantic cut points automatically. State that must survive a restart has to be selected, serialized, and threaded forward explicitly. Granularity remains a workload-specific tradeoff: fine steps add persistence and scheduling overhead, while coarse steps repeat more useful work after failure. Boundaries that split an external effect from its receipt can also make recovery less reliable rather than more efficient.

### Recover heterogeneous workflows from task-level provenance

`ERCA-132` · `provenance-driven-reexecution`

Persist task-level provenance when a workflow crosses environments that lack a shared event log or transaction substrate, recording each task’s inputs, outputs, dependencies, execution environment, and completion state. On failure, use that record to identify the affected dependency subgraph, roll it back to a valid boundary, and re-execute only the tasks that must be restored in their respective environments.

A pipeline spanning cloud services, local tools, high-performance computing jobs, and human actions encounters distinct failure and recovery mechanisms. A formal workflow representation supplies a common dependency model even when those environments cannot participate in one runtime. Directional evidence from Mulone and colleagues ([2024](https://arxiv.org/abs/2407.05337)) shows per-task provenance combined with rollback and re-execution restoring the affected subgraph in the StreamFlow scientific workflow management system. The result supports provenance as a coordination mechanism across heterogeneous execution environments, but it does not establish performance at interactive-agent latencies.

Re-execution remains safe only when tasks are deterministic, idempotent, or otherwise acceptable to recompute. Provenance can identify what should run again, but it cannot undo an email, payment, human decision, or other irreversible effect. Those operations still require durable receipts, idempotency controls, or compensation. Capturing complete provenance also adds storage and integration work, and missing dependency edges can cause the recovery planner to preserve invalid outputs or repeat work outside the truly affected subgraph.

### Certify restore points against committed downstream work

`ERCA-133` · `certify-restores-against-downstream-commitments`

Before restoring an agent step from a checkpoint, inspect which downstream consumers have committed work based on that step’s output. Admit only restore points that preserve those commitments. If a rollback would remove the upstream history supporting an already committed effect, refuse the restore and escalate the case for compensation or human resolution.

Checkpoint alignment establishes that runtime state can be reconstructed at a boundary. It does not establish that the reconstructed history remains compatible with effects already observed elsewhere. Recovery therefore has to evaluate the dependency graph of commitments, rather than treating the failed step as an isolated unit. Directional evidence from Yang, Ke and colleagues ([2026](https://arxiv.org/abs/2605.23311)) demonstrates the distinction in a LangGraph reconstruction: commitment-blocking rejected an alignment-legal restore that would have orphaned two committed consumers. This supports checking downstream commitments as an additional admissibility condition, without establishing a general recovery rate.

The certification is only as sound as the declared dependency and effect metadata. Missing consumer edges can make an unsafe restore appear legal, while overly broad declarations can reject recoverable cases. The check also decides whether rollback is permissible; it does not synthesize compensations, reverse external effects, or choose the appropriate escalation. Workflows using opaque tools or undeclared side channels may therefore require stricter publication boundaries before this practice can protect them.

### Diagnose failures before admitting guidance to a retry

`ERCA-134` · `diagnose-then-gate-recovery`

After restoring a failed run, classify the failure and select a matching intervention such as replanning, prompt correction, or tool reselection. Convert telemetry into structured evidence, then pass guidance into the next attempt only when it is grounded in that evidence, actionable by the agent, and confined to behavior the recovery layer can influence. Withhold guidance when the trace cannot support a bounded intervention.

The mechanism connects diagnosis to an instruction that a subsequent attempt can execute and verify. Strong evidence from Zhao and colleagues ([2026](https://arxiv.org/abs/2605.08717)) measured the gap across 257 cases: top-1 diagnosis accuracy was 65.37%, while recovery was 21.79%. Their PROBE approach used evidence-grounded, bounded guidance and beat the strongest tested baseline by 12.45 points on recovery. The result shows that accurate diagnosis was necessary but insufficient in those conditions, and that structuring the handoff from diagnosis to retry improved measured recovery.

Detection accuracy still limits the entire loop, and the absolute recovery rate remained 21.79%. Requiring evidence deliberately leaves some failures without automated guidance, so coverage is partial by design. Guidance attached through a side channel can change only the behavior exposed through that channel. The evaluation also comes from a framework prototype with limited comparisons, so its measured gain should not be treated as evidence of general self-healing across repositories, enterprise workflows, AIOps systems, or multi-agent runtimes.

### Expose recovery as failure-free only through monotonic observations

`ERCA-136` · `hide-recovery-behind-monotonic-observability`

Present checkpoint and recovery as a failure-free programming model only when external observers see committed state monotonically. Buffer output until its epoch or transaction commits, and prevent tools, notifications, streams, or other side channels from revealing state that recovery might later abandon.

Internal restoration cannot erase an observation already delivered outside the runtime. If an observer sees an intermediate effect and recovery returns to an earlier checkpoint, the resulting history may no longer correspond to any failure-free execution of the program. Directional formal evidence from Veresov and colleagues ([2024](https://arxiv.org/abs/2407.06738)) defines failure transparency through observational explainability and proves the property for a small-step model of Flink’s protocol when observers see only committed state monotonically. The result makes the observation boundary central: checkpointing reconstructs internal state, while controlled publication keeps the visible execution explainable.

The proof concerns a formal model rather than the production Flink implementation. Any channel that exposes uncommitted output breaks the property by construction. An agent that emails a draft, updates a ticket, invokes a non-idempotent tool, or streams a decision before commit has created an observation that local rollback cannot conceal. Such workflows need transactional publication, idempotent effects, or explicit compensation, and they should not promise invisible recovery unless every externally visible path follows the same commit discipline.

### Inject semantic failures from a realistic fault menu

`ERCA-052` · `fault-inject-with-realistic-fault-menu`

Build a fault menu from failures observed in agent traces, map each failure to the system layer that can produce it, and inject it there through prompt modification, response rewriting, or message-routing manipulation. Include syntactically valid failures that ordinary exception tests miss, such as hallucinated content, misread instructions, reasoning drift, context noise, tool delays, API failures, and corrupted coordination. These faults can propagate through successful calls and plausible messages, so recovery tests expose whether later agents detect, contain, or amplify them.

Jia and colleagues ([2026](https://arxiv.org/abs/2602.19843)) performed semantic fault injection across 15 fault types and three representative multi-agent-system architectures. Stronger foundation models did not uniformly improve robustness, and closed-loop topologies neutralized >40% of faults that were catastrophic in linear pipelines. A survey of 160 sources by Yu and colleagues ([2024](https://arxiv.org/abs/2407.00125)) found persistent discrepancies between injected fault menus and observed failures across six AI-system layers. As a practical variant, one framework vendor reported randomizing initial states while injecting context noise, tool delays, and API failures, then scoring cost-per-success rather than raw pass rate. A project dossier similarly illustrates seven premortem failure narratives whose leading mitigations were traced to shipped changes, but it supplies no independent validation.

Synthetic injection cannot establish the production frequency of any fault or certify tolerance to omitted classes. Real fault distributions may differ, agent-specific menus remain immature, and closed loops consume additional latency and tokens. The practitioner report is self-promotional and does not show that its chaos distribution matches deployed systems.

## Chapter 10: Human-auditable failure analysis and taxonomy development

3 taught in the chapter, 7 carried here. 10 practices in total.

The following pointer entries identify the practices taught in Chapter 10, where their full arguments, evidence, and boundaries are developed.

### Derive the failure taxonomy from your own traces

`ERCA-045` · `derive-taxonomy-from-own-traces`

Build the failure taxonomy from a substantial, varied sample of your own raw traces, recording open-ended human observations and labeling the first upstream failure in each run. Cluster those observations into a small set of actionable themes, then direct mitigation toward the stages and classes where failures concentrate. Chapter 10 develops this trace-led method for creating useful taxonomies.

### Keep humans responsible for failure attribution

`ERCA-046` · `keep-humans-in-failure-attribution`

Keep people responsible for determining which agent and decision produced a failure, supported by instrumentation that preserves the decisive step in structured state. Use automation to organize evidence for review, not to replace human judgment with post-hoc model inference over logs. Chapter 10 develops the attribution workflow and the observability required to make it practical.

### Design traces for human audit

`ERCA-047` · `design-traces-for-human-audit`

Structure traces around step boundaries, tool calls, decision points, inputs, retries, and outcomes so a person can reconstruct what happened and replay the relevant decision. Design the audit experience for factual inspection rather than asking a model to infer the cause from an undifferentiated transcript. Chapter 10 develops the trace design needed for rigorous human failure analysis.

The following compact entries record practices attached to Chapter 10’s mechanism but not taught in full by any chapter.

### Localize failures from a constraint-violation log

`ERCA-049` · `judge-from-constraint-violation-log`

Before asking a human or model judge to localize a failure, convert the task requirements into explicit constraints, evaluate each constraint against every relevant trajectory step, and produce a violation log that links each finding to its evidence. The judge then examines discrete claims about which requirement was breached and when. This narrows an open-ended interpretation problem while preserving a path from every attribution back to observable events. In a directional evaluation of 115 annotated failed trajectories, Barke and colleagues ([2026](https://arxiv.org/abs/2602.02475)) found that constraint-violation logs improved step localization and attribution over judging raw traces across structured application workflows, incident management, and open-ended web and file tasks.

The resulting diagnosis can only cover constraints represented in the log. Constraint synthesis is itself model-generated, so implicit requirements, domain conventions, or dependencies between individually valid steps may disappear before judging begins. The evaluation did not cover production coding agents, where repository state and delayed test effects may make violations harder to express locally. Retain the complete trajectory alongside the derived log, independently check high-consequence constraints, and allow investigators to challenge both the violation and the constraint that produced it. The log supplies a structured diagnostic surface, while the chapter’s existing human-audit controls remain responsible for adjudicating uncertain causal claims.

### Monitor early trajectory shape during execution

`ERCA-050` · `monitor-early-trajectory-shape`

Instrument active runs to track trajectory length, step-to-step variance, tool-call growth, and the beliefs formed during the first few execution steps. Runs that become long or erratic should enter an early-review queue, with reviewers checking especially for incorrect assumptions about the repository, available tools, or execution environment. A directional observational study across OpenHands, SWE-agent, and Prometheus on SWE-bench found that failed trajectories were consistently longer and more variable than successful ones, even while file localization remained sound, as reported by Majgaonkar and colleagues ([2025](https://arxiv.org/abs/2511.00197)). These shape changes can therefore become visible before the terminal outcome.

A second directional observational study by Zhao and colleagues ([2026](https://arxiv.org/abs/2607.09510)) examined 1,794 annotated command-line coding-agent trajectories containing 63,000+ steps. Failures were predominantly associated with epistemic errors that began within the first few steps, supporting an onset, evolution, and unrecoverability model of failure. That model directs supervision toward early beliefs and later recovery attempts instead of concentrating only on the final error.

These studies do not establish a universal abort threshold. Patterns differed significantly between agents, and exploratory work can legitimately produce long, variable trajectories. Estimate baselines separately for each scaffold and workload, then use shape changes to prioritize review or tighten supervision. Repository-scale work with continuous-integration feedback may exhibit different recovery dynamics.

### Preempt environment errors before reasoning begins

`ERCA-051` · `preempt-environment-errors`

Add deterministic dependency checks, permission probes, service-health checks, and namespace-conflict detection before an agent begins reasoning, and classify resulting failures separately from model failures. Missing modules, incompatible types, operating-system faults, and database-integrity errors can otherwise trigger repeated diagnosis and repair attempts against conditions the agent cannot resolve. A directional process-mining study by Chen and colleagues ([2025](https://arxiv.org/abs/2503.12374)) examined 3,977 solving trajectories and 3,931 test logs from 8 agents on 500 SWE-bench issues. Python execution errors correlated with lower resolution rates and higher reasoning overhead, with the most damaging cases taking the form of infrastructure faults. The authors consequently recommended mechanical checks that expose such conditions before the main solving loop.

Illustrative evaluation cases show the resulting attribution errors directly. Repairing two broken baseline Dockerfiles changed a reported +0.277 tool-integration advantage into a corrected baseline score of 0.827 against 0.770, with the baseline ahead on 4 of 6 tasks. Elsewhere, a binary-name collision contaminated 9 of 9 trials before a smoke check exposed it. These cases illustrate the mechanism without increasing the study’s evidence grade.

Some execution errors provide useful feedback, and the SWE-bench platform itself contained defects uncovered during the study. Aim to prevent unbounded cascades and misclassification, while preserving recoverable errors that teach the agent something about the task.

### If automating attribution, investigate hierarchical context and independent judges

`ERCA-053` · `aggregate-independent-attribution-judges`

If a team experiments with model-based attribution, it could divide the trace into hierarchical context levels, run several genuinely independent judge passes, and combine their outputs through consensus or confidence-aware weighting. Disagreement could trigger another pass or human review instead of being hidden by a forced verdict. Hierarchical levels would limit the evidence each judge must interpret at once, while independent passes could reduce reliance on one position-sensitive reading. In a directional author-run evaluation, Banerjee and colleagues ([2025](https://arxiv.org/abs/2510.04886)) found that hierarchical context leveling with consensus voting outperformed all-at-once, step-by-step, and binary-search attribution. Another directional author-run evaluation by Xia and colleagues ([2026](https://arxiv.org/abs/2607.07989)) combined independent evaluators using confidence-aware aggregation and fed disagreement back into the judging process.

The support is too thin to recommend this practice. This aside is a lead for investigation when building automated triage priors. Both studies evaluated multi-agent interaction scenarios, consensus would multiply inference cost, and one preprint had zero external citations at adjudication. Agreement among dependent or individually weak judges would not establish causation, and the attribution ceiling described in the chapter would still apply. An earliest-decisive-step formulation would also fit gradual deterioration poorly, since several recoverable errors may jointly narrow the run’s options. Any experimental use should preserve disagreement and defer consequential attribution to human review.

### Differentially test the agent against an environment oracle

`ERCA-054` · `differential-test-before-blaming-agent`

Before assigning a failure to the agent, sample diverse environment configurations, such as with a Latin Hypercube over configurable parameters, and submit each task to an agent-independent planner or solver. Classify an agent failure only for configurations where that feasibility oracle succeeds while the agent fails. The comparison prevents an inherently infeasible task instance from entering the model-failure bucket merely because the agent encountered it first. In a directional black-box evaluation, Anand and colleagues ([2025](https://arxiv.org/abs/2507.03870)) used an independent planner to separate systemic agent errors from environment errors and reported detecting more total and unique errors than the evaluated prior methods across their domains.

Existing evaluation controls illustrate how the same separation can be represented operationally. One system assigns every failed trial exactly one agent, harness, oracle, or infrastructure cause. Another reserves separate exit statuses for rule violations and infrastructure faults, so missing configuration or unavailable services cannot appear as agent noncompliance. These cases illustrate explicit classification without strengthening the black-box study’s evidence.

Differential testing requires a credible independent oracle. Classical planners can provide one cheaply in structured domains with computable feasibility, but open-ended coding tasks rarely offer an equivalent solver. The method detects behavioral disagreement without identifying its causal mechanism, so trace inspection remains necessary. Where no oracle exists, retain environment, harness, and task infeasibility as live alternatives during attribution.

### Canonicalize trajectories without discarding source events

`ERCA-057` · `canonicalize-trajectories`

Map scaffold-specific trace events into a compact action vocabulary such as search, read, edit, validate, and revert, then attach deterministic effect labels and scan the normalized sequence for named anti-patterns. Paired runs can be aligned at the point where their canonical behaviors diverge, making traces from different agents or versions mechanically comparable. A directional study by Shu and colleagues ([2026](https://arxiv.org/abs/2607.06184)) applied this approach to 2,500 trajectories from five production settings on SWE-bench Verified. Function-level selection separated successful from failed behavior where file selection was too coarse, while rule-based detectors exposed search loops and skipped verification that terminal resolve rate concealed.

Canonicalization can also reduce the reading burden without deleting evidence. A directional author-run evaluation by Wang and colleagues ([2026](https://arxiv.org/abs/2605.26563)) found that diagnosis effectiveness degraded as repository-level coding trajectories grew longer and noisier. Filtering content judged irrelevant and seeding diagnosis from test-failure reports improved diagnosis in that evaluation. Because such filtering is heuristic, an unusual failure may place its decisive event among the discarded lines. Preserve the immutable raw trajectory and treat every filtered view as a reversible projection.

The vocabulary and anti-pattern rules require manual adaptation and validation for each new scaffold. Overly coarse actions can erase consequential differences, while pairwise convergence analysis requires controlled reference runs. Use canonical labels to transform and index process evidence, leaving the original events available for human audit.

### Use run-to-run consistency as a per-task risk signal

`ERCA-062` · `use-run-consistency-as-risk-signal`

If you are investigating consistency as a risk signal, you could run an agent repeatedly on the same input, compare its action paths, and flag tasks whose paths diverge, especially at their first decisions. Divergence may reveal inputs for which small sampling differences send execution toward different tools, intermediate states, or conclusions. A single-author preprint by Mehta ([2026](https://arxiv.org/abs/2602.11619)) found a directional association between greater action-path divergence and poorer outcomes in ReAct-style agents on HotpotQA, with divergence becoming visible early enough to inform per-task review routing.

The support is too thin to recommend this practice; this entry is a lead for investigation. Repeated execution multiplies inference cost, and evidence from question answering does not establish that the signal transfers to coding agents. The measure reports whether paths agree, while correctness still requires an independent check. Mehta’s follow-up ([2026](https://arxiv.org/abs/2606.22936)) found that its commitment signal could not separate committed-correct from committed-wrong questions. A consistently wrong agent could therefore appear low risk. Both papers are single-author preprints from the same researcher using the same ReAct and HotpotQA setting, so they do not provide independent corroboration. Any experimental use for review routing or confidence estimation would need evaluation against an external correctness check in the target system.

## Chapter 11: Measuring and designing repository retrieval

3 taught in the chapter, 5 carried here. 8 practices in total.

The following pointer entries identify the practices taught in Chapter 11, where their full arguments, evidence, and boundaries are developed.

### Score retrieval separately from final answers

`ERCA-076` · `score-retrieval-and-generation-separately`

Measure whether the system surfaced the needed evidence, where it ranked, and whether the generator used it, then report those diagnostics separately from completion quality. This separation makes retrieval and generation failures visible as distinct engineering problems. Chapter 11 develops the scoring design and explains how to interpret both process diagnostics and end-to-end results.

### Run hybrid retrieval and fuse the ranked results

`ERCA-083` · `hybrid-retrieval-fused-on-ranks`

Run lexical and semantic retrieval as parallel, first-class channels, then combine their ranked outputs with reciprocal-rank fusion while preserving each lane for inspection. This gives exact identifiers and paraphrased concepts independent routes into the candidate set and makes ranking faults traceable. Chapter 11 explains how the channels, fusion, and diagnostics work together.

### Chunk code along AST boundaries

`ERCA-085` · `chunk-on-ast-boundaries`

Construct retrieval chunks from syntactic units by recursively splitting large AST nodes and combining small related siblings within a size budget. The resulting chunks preserve coherent functions, classes, and declarations so retrieved code remains understandable and useful for generation. Chapter 11 develops the structure-aware chunking procedure and its role in repository retrieval.

The following compact entries record practices attached to Chapter 11’s mechanism but not taught in full by any chapter.

### Bridge lexical gaps before generation

`ERCA-073` · `retrieve-across-lexical-gaps`

Route tasks through semantic or structural retrieval when their descriptions share no surface vocabulary with the required code. Issue reports often describe behavior in user-facing terms while implementations expose domain-specific symbols, so adding more repository text does not necessarily reveal the association. A controlled long-context evaluation by Modarressi and colleagues ([2025](https://arxiv.org/abs/2502.05167)) removed literal matching cues and found that 10 of 12 models claiming >=128K windows fell below 50% of their short-context baseline at 32K tokens. GPT-4o moved from 99.3% to 69.7%. The measurement shows that nominal window capacity does not guarantee reliable retrieval across a latent association.

Diagnose the query before selecting the retrieval path. Exact symbols, error strings, configuration keys, and distinctive phrases provide anchors that lexical search and in-context attention can exploit effectively. In those cases, semantic retrieval may add cost and distractors without improving localization. This practice applies when the missing relationship is non-lexical, especially in issue-to-code localization or pipelines that place large corpora in context and expect the generator to discover unstated correspondences. Use the least expensive method that closes the observed vocabulary gap, then confirm that its result is current and structurally connected to the task.

### Re-query the repository as the draft develops

`ERCA-074` · `iterate-retrieval-with-generation`

Run another repository query whenever a draft, exploration result, or failed attempt exposes a new symbol, dependency, or unresolved assumption. The initial query can use only the language available in the task, while intermediate output often names the API, neighboring implementation, or type relationship that the next pass should retrieve. Generation therefore produces evidence for refining retrieval. In a repository-level code-completion comparison, Zhang and colleagues ([2023](https://arxiv.org/abs/2303.12570)) found that iterative retrieval and generation beat single-shot RAG and improved over in-file-only baselines by >10% on RepoEval.

Preserve each query, candidate set, and draft so evaluation can distinguish productive refinement from repeated access to the same material. A useful loop stops when the draft no longer introduces unresolved repository-specific references, the retrieved set stabilizes, or another pass fails to improve an explicit check. Each iteration consumes latency, tokens, and tool calls, and accumulated passages can dilute relevant evidence. Pair the loop with a retrieval gate so straightforward completions and already-grounded drafts skip it. Its value is greatest when partial generation makes a previously hidden context deficit observable; unconditional iteration merely turns retrieval cost into a fixed tax.

### Gate retrieval on its expected downstream benefit

`ERCA-075` · `gate-retrieval-on-expected-benefit`

Insert a query-level policy that predicts whether retrieved context will improve the target model’s output, and skip retrieval when that prediction falls below a calibrated threshold. Apply the same decision at architecture scale by measuring whether each task class benefits enough to justify retrieval infrastructure. Retrieved passages can consume attention, introduce plausible but misleading code, and add tool or reranking cost. In code-completion experiments, Wu and colleagues ([2024](https://arxiv.org/abs/2403.10059)) found that threshold-based selective retrieval beat always-retrieving and greedy selection on RepoEval and CrossCodeEval. Their 16B policy achieved state-of-the-art accuracy with up to 70% inference speedup, and 1B and 3B variants were also released.

Calibrate the gate against downstream task performance rather than treating retriever similarity as the objective. Similarity indicates topical proximity, but it does not establish that the generator can use the passage or that the passage changes the answer beneficially. At the system level, a survey by Tao and colleagues ([2025](https://arxiv.org/abs/2510.04905)) identifies the boundary between retrieval-augmented code generation and long context as an open measurement problem. That directional evidence supplies no universal decision procedure.

Draw the operating boundary from effective-length, saturation, cost, and failure measurements for the specific model, repository scale, and task distribution. A gate transferred without recalibration can suppress essential context or authorize harmful context, especially after the target model or workload changes.

### Test retrieval quality and context use independently

`ERCA-077` · `fix-both-ends-of-rag`

Before improving the retriever, test whether the generator can solve the task when given ideal context within the actual window budget; before expanding the window or changing the generator, test whether retrieval surfaces the required material. These experiments separate context acquisition from context integration. When either stage is limiting, an improvement to the other may leave end-to-end performance unchanged and create a misleading null result. In a benchmark spanning five retrieval sources and three task classes, Wang and colleagues ([2024](https://arxiv.org/abs/2406.14497)) found bottlenecks at both ends: retrievers struggled when lexical overlap was limited, while generators sometimes failed to use supplied context under constrained windows or weak context-integration ability.

Use retrieval-only judgments to estimate the acquisition ceiling and oracle-context runs to estimate the generator ceiling, then direct investment toward the active constraint. Repeat the diagnosis after changing the task mix, chunk policy, context budget, or model because any of these can move the bottleneck. The balance observed for basic programming tasks does not automatically transfer to open-domain or repository-level work. Evidence that both constraints exist supports a two-sided diagnosis, but it does not establish a universal rule about which side deserves investment first.

### Prune cheaply, then rerank a small candidate set

`ERCA-089` · `stage-cheap-retrieval-then-rerank`

Use an inexpensive retriever to reduce the corpus, then apply a cross-encoder or late-interaction reranker only to the top 20-30 candidates. Candidate count multiplies the cost of the expensive technique, so staging preserves broad first-pass coverage while concentrating detailed comparison near the context cutoff. A strong retrieval study by Khattab ([2020](https://arxiv.org/abs/2004.12832)) supports this cheap-first-stage, expensive-shortlist design and shows that first-stage quality caps the achievable result. Treat initial ranks as provisional and train the candidate generator with hard negatives when function-level localization matters.

For code localization, Suresh and colleagues ([2024](https://arxiv.org/abs/2412.01007)) found that consistency-filtered contrastive data and curriculum hard-negative mining yielded state-of-the-art code retrieval and reranking on real GitHub issues. No reranker can recover a required function omitted from its shortlist. Store stable file and symbol metadata with every chunk so the context assembler can retrieve a small companion span when import or type resolution is needed, without broadening the entire candidate set.

Sweep shortlist depth against first-stage recall, final localization quality, and latency instead of treating 20-30 as universal. Gains also depend on how well the retriever’s training languages and issue distribution match the target repositories. Interactive systems may find the extra reranking stage too slow, while a weak candidate generator leaves expensive reranking with an irreducible ceiling.

## Chapter 12: Localization funnels, repository indexes, and freshness checks

3 taught in the chapter, 8 carried here. 11 practices in total.

The following pointer entries identify the practices taught in Chapter 12, where their full arguments, evidence, and boundaries are developed.

### Localize repository changes through a staged funnel

`ERCA-084` · `staged-localization-funnel`

Move through repository structure, candidate files, relevant symbols, and concrete edit locations as explicit narrowing stages. Give each stage the context and localization machinery suited to its granularity, with particular attention to assembling the right file set before reasoning about edits. Chapter 12 develops this funnel as a complete repository-localization workflow.

### Index the repository as a typed knowledge graph

`ERCA-174` · `index-repository-as-knowledge-graph`

Represent directories, files, classes, functions, and linked development artifacts as typed nodes connected by containment, import, invocation, inheritance, definition, and reference relationships. Search and traverse that graph to answer structural questions and reach change sites through compact multi-hop paths. Chapter 12 develops the indexing model, traversal workflow, and downstream localization design.

### Gate retrieved context on freshness and authorization

`ERCA-078` · `gate-retrieval-on-freshness`

Refresh retrieval indexes against the working tree and verify that returned evidence reflects the repository’s current state before placing it in model context. Apply authorization checks at the same gate so only current, permitted material can influence reasoning or edits. Chapter 12 develops the freshness and access controls required for dependable repository retrieval.

The following compact entries record practices attached to Chapter 12’s mechanism but not taught in full by any chapter.

### Retrieve completion context through structural relations

`ERCA-079` · `retrieve-by-structure`

Add a structural retrieval lane that narrows completion context through control-flow, data-dependence, and syntax relations before selecting code fragments. Statements connected to the completion point through execution or value flow can supply useful context even when they share little vocabulary with it. Liu and colleagues ([2024](https://arxiv.org/abs/2406.07003)) compared dependence-graph retrieval with sequence-similarity RAG baselines for repository-level completion. Graph-keyed retrieval improved exact match on code by +6.06 and identifier match by +6.23 while using less time and space. Guo and colleagues ([2020](https://arxiv.org/abs/2009.08366)) likewise provide strong evidence that structural and data-flow signals support code retrieval, while Ye and colleagues ([2020](https://arxiv.org/abs/2006.05265)) support the direction of this practice without supplying a cataloged magnitude.

Keep literal text search and semantic code search as separate query lanes. A trigram index answers where a string occurs; an AST or semantic index answers where a symbol is defined, referenced, or connected across files. Route each question accordingly, retain lexical and dense retrieval for files that fail to parse, and disclose when the system has fallen back. The measured gains concern completion-scale context assembly. They do not establish equivalent gains for whole-issue resolution. Each supported language also requires parsers and maintained structural data, so the lane carries continuing construction and freshness costs.

### Front-load a condensed repository map

`ERCA-086` · `front-load-a-repo-map`

Generate a structured repository map before the agent opens source, let it identify likely files and subsystems from that map, and descend into raw code only where implementation detail is needed. Compression preserves repository shape within a workable context window, reducing the tool calls spent paging through weakly directed search results. Tawosi and colleagues ([2025](https://arxiv.org/abs/2508.02611)) report directional evidence that summary-first reasoning can reduce repository context while retaining useful file and function localization. Yang and colleagues ([2024](https://arxiv.org/abs/2405.15793)) also found that adding iterative search could perform worse than providing no search interface, showing how undirected exploration can consume budget without improving resolution.

Choose the descriptor format according to how malformed content fails. Jin ([2026](https://arxiv.org/abs/2604.13108)) found directional evidence that architecture descriptors reduced navigation work, while detecting no significant comprehension difference among S-expression, JSON, YAML, and Markdown. The formats instead differed in whether structural damage became visible or silently changed meaning. That study evaluated the author’s own toolkit, and its format comparison had limited power for smaller effects.

A repository map discards implementation detail by design and can drift from the working tree like any other index. Treat it as an orientation layer, record the repository state it describes, and require source inspection before fine-grained edits. Its weaker function-level localization also prevents treating summary selection as final localization.

### Inject static-analysis facts beside the code

`ERCA-087` · `inject-static-anchors`

Place selected call-graph, inheritance, and configuration-dependency facts beside the code as plain-text annotations, with the primary goal of making navigation repeatable across runs. Keyword-driven exploration can send identical tasks through different files and tool trajectories. Deterministic structural relations narrow those choices, giving successive runs common landmarks even when the model generates different search terms. Lin and colleagues ([2026](https://arxiv.org/abs/2606.26979)) provide directional evidence that static-structure annotations improve run-to-run stability more than raw capability on a strong Codex baseline.

The study measured localization, trajectory, and stability separately. Pass rate alone can hide whether repeated runs reach the same area through compatible paths, so assess agreement among locations and tool sequences alongside task completion. This practice can reduce variance even when the mean success rate changes little.

The evidence covers medium-scale repositories and added roughly 10% more input tokens. Annotation design also depends on topology: dense-semantic repositories can reach diminishing returns, while hub-heavy repositories may gain more from inverse links that expose callers. Static facts must be refreshed with the code, since stale annotations can repeatedly steer runs toward the same obsolete relation. Keep the injected set selective, and evaluate whether reduced variance justifies its context and analysis costs.

### Schedule exploration by relevance and prune it by graph distance

`ERCA-090` · `schedule-exploration-prune-by-distance`

Maintain a priority queue of pending exploration actions, split coarse actions into independently scoreable steps, and remove context that lies too far from the current suspect before it enters the model window. The queue spends each tool call on the strongest available lead instead of following whichever branch the agent generated first. Decomposition makes broad actions comparable, while distance-aware pruning limits interference from structurally remote code.

Yu and colleagues ([2025](https://arxiv.org/abs/2502.00350)) provide directional evidence from OrcaLoca on SWE-bench Lite. Their system combined priority scheduling, action decomposition, and distance-aware pruning, became the top open-source localizer on that benchmark at the time, and improved downstream patching when paired with a repair pipeline. Component ablations supported each mechanism’s contribution, but all three were studied within one system and one benchmark.

A relevance score can rank the wrong branch highly, and aggressive distance pruning can discard the true path before contradictory evidence appears. Preserve queue scores and rejected candidates so failures remain diagnosable, and add checkpoints that allow alternative suspects back into consideration. Graph distance also depends on a dependency structure that exists and reflects the current repository. Measure resolved issues alongside localization accuracy, since efficient movement toward an incorrect suspect only makes the failure faster.

### Walk the current call graph when no maintained index is available

`ERCA-091` · `walk-call-graph-at-query-time`

Build and expand module and function call graphs during each query when maintaining a persistent index is impractical. Begin from plausible entry points, use module relations to reduce the initial search area, and then follow function calls outward while pruning the frontier to fit the context budget. Because the relations come from the current working tree, this method avoids consulting a structural index that may describe an earlier repository state.

Jiang and colleagues ([2025](https://arxiv.org/abs/2503.22424)) provide directional evidence from CoSIL that query-time module and function graph expansion can support issue localization without a pre-built index. The module graph supplies coarse narrowing, and the function graph adds structural detail only as the search reaches it. Explicit pruning balances search coverage against the amount of context shown to the model.

The system pays for that freshness by reconstructing and traversing relations on every query, repeating work that a maintained index would amortize. Pruning remains a sensitive control: cutting too early can remove the only route to the faulty function, while retaining too much recreates the original context problem. CoSIL also reports that the system with the highest function match rate resolved fewer issues than a lower-matching system. Graph matches therefore cannot stand in for downstream repair results. Use this pattern where repository churn or infrastructure limits outweigh repeated traversal cost, and evaluate the patches produced after localization.

### Add statement-level def-use edges for line precision

`ERCA-175` · `extend-graph-below-function-level-for-line-precision`

Extend the repository graph with statement nodes and intra-procedural definition-use edges when the agent must identify particular lines rather than stop at a function. Expose data-flow slicing as a direct query so the agent can retrieve the statements that define or consume a variable in one operation. This layer represents value movement that containment and call graphs omit, allowing localization to follow the state involved in a fault instead of reconstructing it through repeated text searches.

Seddik and colleagues ([2026](https://arxiv.org/abs/2605.03117)) provide strong evidence from controlled ablations of ARISE on SWE-bench Lite. Adding the data-flow graph and its query tools produced +17.0 Function Recall@1, +15.0 Line Recall@1, and +4.7pp Pass@1 over unmodified SWE-agent. The result attributes gains to below-function structural information under the evaluated conditions, connecting finer localization with improved patch outcomes rather than reporting graph matches alone.

Those conditions are narrow. The evaluation used Qwen2.5-Coder-32B and Python-only repositories, while definition-use extraction requires language-specific analysis machinery. Supporting another language therefore means implementing and validating its own treatment of assignments, scopes, aliases, and control flow. File-level or function-level tasks may not repay that cost. Reserve statement graphs for workflows that must commit to exact program points, such as patch generation, security-fix pinpointing, and mutation analysis, and test the resulting repairs as well as their localization scores.

### Route entity queries to cheap graph lookups and reserve model exploration for ambiguous questions

`ERCA-176` · `route-entity-queries-to-cheap-graph-lookups`

Split repository-graph retrieval into two lanes: send queries that name a code entity and request its callers, dependencies, definition, or references to deterministic graph operations, while assigning entity-free natural-language questions to LLM-guided exploration. Named-entity requests expose a stable traversal target, allowing exact graph operations to return reproducible neighborhoods without paying for model planning. For questions expressed only in natural language, textual descriptions and embeddings on graph nodes provide a bridge from the user’s vocabulary to relevant code entities. Concentrating exploration in that lane directs the larger search budget toward queries whose target must first be inferred.

Directional benchmark evidence from Shah and colleagues ([2025](https://arxiv.org/abs/2509.25257)) supports this division of query traffic. Their RANGER pipeline used deterministic Cypher lookups for entity queries and LLM-guided MCTS graph exploration for natural-language queries, with evaluation on CodeSearchNet, RepoQA, RepoBench, and CrossCodeEval. Adoption shifts substantial cost into constructing and maintaining a comprehensive graph down to variable-level entities. Entity resolution also remains a failure point because a mistaken identity can yield an exact traversal of irrelevant nodes. The reported evidence covers retrieval and completion benchmarks, so it cannot establish improved end-to-end issue resolution.

### Compare indexed representations before choosing one

`ERCA-177` · `treat-index-representation-as-first-class-design-choice`

Benchmark file paths, raw source, and role-aware file summaries before fixing what a retrieval index stores, and prefer summaries for file-level localization when their measured accuracy and footprint suit the deployment. Each representation exposes different matching signals: paths provide compact identifiers, summaries foreground a file’s role, and source preserves implementation detail at much greater storage and retrieval cost. Measuring retrieval quality alongside representation footprint reveals whether apparent retriever improvements actually come from changing the information available to it. Complementary representations and reranking can then be tested as explicit additions instead of inherited defaults.

Strong evidence from file-level localization experiments by Caumartin and colleagues ([2026](https://arxiv.org/abs/2607.11046)) found that role-aware summaries outperformed file-path representations by up to 40% Hit@5 while using a representation footprint 10.4-20.9x smaller than raw source. Combining complementary representations added up to 31.9% further, and LLM re-ranking added up to 42.0% further. The comparisons covered LCA and SWE-bench Verified and found no single winner across retrievers and datasets; raw source still performed best in some settings at substantially higher cost. These results apply to file-level localization and do not establish function-level or line-level precision, so representation choice must be measured again when retrieval granularity changes.

## Chapter 13: Usable context budgets, consolidated-spec restarts, and file-based tool output

4 taught in the chapter, 6 carried here. 10 practices in total.

The following pointer entries identify the practices taught in Chapter 13, where their full arguments, evidence, and boundaries are developed.

### Budget context using measured effective capacity

`ERCA-072` · `budget-to-measured-effective-context`

Measure each model’s usable context on tasks resembling the actual workload, including retrieval, multi-hop reasoning, aggregation, and long-code understanding. Set harness and retrieval budgets from the observed saturation point so the working context remains useful rather than merely fitting within the advertised window. Chapter 13 develops the evaluation method and context-budgeting practice.

### Consolidate the specification and restart lost runs

`ERCA-088` · `consolidate-spec-restart-lost-runs`

Present requirements as a consolidated specification and periodically restate them when they arrive across multiple turns. If a run has committed to the wrong interpretation, restart from the consolidated context instead of extending the damaged trajectory with more corrections. Chapter 13 develops this approach to specification delivery, recovery, and reliable multi-turn execution.

### Persist large transient outputs as files

`ERCA-143` · `persist-transient-context-as-files`

Write long tool results, terminal transcripts, and pre-compaction conversation history to session-scoped files, leaving concise pointers in the active context. Reopen, search, or tail those files when their details become relevant so the reasoning window stays dense without discarding recoverable information. Chapter 13 develops the file-backed context workflow and its integration with agent sessions.

### Evaluate and maintain context files like configuration

`ERCA-178` · `measure-context-files-and-maintain-them-like-config`

A/B-test repository context files against a no-file baseline before adopting them, and measure both task outcomes and inference cost. Keep retained files focused on nonstandard repository constraints, then evolve them through small, reviewed changes that include commonly neglected security and performance requirements. Chapter 13 develops the evaluation and maintenance discipline for these files.

The following compact entries record practices attached to Chapter 13’s mechanism but not taught in full by any chapter.

### Put load-bearing evidence at the edges of the context

`ERCA-070` · `edge-load-key-evidence`

Reserve the beginning and end of assembled context for the evidence most likely to determine correctness, such as the failing test, target function, decisive constraint, or key interface. Documents of lesser consequence can occupy intermediate positions. Controlled multi-document question-answering and key-value retrieval experiments by Liu and colleagues ([2023](https://arxiv.org/abs/2307.03172)) measured a U-shaped sensitivity curve: models used relevant material less reliably when it appeared near the middle of a long context. Edge placement makes use of that positional behavior without requiring additional tokens.

If the serving stack exposes model internals, calibrate positional attention against relevance. Otherwise, estimate document relevance externally, order the context accordingly, and test whether different edge assignments change end-task results. Directional experiments by Hsieh and colleagues ([2024](https://arxiv.org/abs/2406.16008)) attributed lost-in-the-middle behavior to intrinsic positional bias and found that calibrating attention toward relevance improved long-context retrieval-augmented generation.

Ordering remains a mitigation. Positional curves differ across models and tasks, relevance estimates can put the wrong document in a privileged location, and rearrangement cannot recover competence once the supplied length exceeds what the model can use. API-only systems also cannot perform direct attention calibration. Treat edge placement as a model-specific assembly policy and validate it on the task distribution the harness actually serves.

### Qualify context with semantic tracing instead of needle recall

`ERCA-071` · `verify-semantic-not-verbatim-recall`

Replace verbatim needle tests with evaluations that require the model to trace operational semantics, propagate state, or predict behavior under counterfactual inputs. Keep code that the model must mentally execute near a context edge until those evaluations show that its position no longer changes performance. Finding or repeating a string measures lexical access, while coding work usually requires relations among operations to survive retrieval and influence subsequent reasoning.

A controlled counterfactual study across 10 models by Štorek and colleagues ([2025](https://arxiv.org/abs/2505.13353)) found near-perfect position-independent lexical recall while semantic recall deteriorated for centrally positioned code. The reported median accuracy drop was 92.73% on SemTrace versus 53.36% on CRUXEval. The study also found that existing code-understanding benchmarks often admitted pattern-matching shortcuts, allowing strong scores without dependable execution of the supplied program.

The experiment used synthetic, deliberately unpredictable operations. Real repositories contain meaningful names, familiar APIs, repeated structures, and conventions that may help a model reconstruct behavior. Those cues can also reopen shortcuts and make an evaluation appear stronger than the reasoning it is intended to measure. Shape semantic tests around representative production paths, vary identifying surface cues, and report lookup performance separately from execution performance.

### Give the agent a milestone-triggered compaction action

`ERCA-082` · `compaction-as-agent-action`

Expose context maintenance as a callable action that the agent invokes after stable milestones such as a verified patch, a settled design decision, or a completed investigation. Have the action preserve stable task semantics, condense older working state, and retain recent interactions at higher fidelity. Append-only histories accumulate obsolete branches, duplicated evidence, and superseded assumptions; separating these classes lets the working context reflect the task’s current state instead of its entire chronology.

A directional benchmark result from Liu and colleagues ([2025](https://arxiv.org/abs/2512.22087)) found that agent-invoked structured compression under a bounded context budget outperformed static compression and ReAct-style baselines on SWE-bench Verified. Its mechanism matters as much as its timing: the agent could compact when trajectory state made the distinction between settled and still-active information visible.

The compressor received trajectory-level supervision, so the result does not establish that a general-purpose model prompted to summarize will behave similarly. Without that training, success depends on summarization fidelity and reliable milestone recognition. Premature compaction can erase an unresolved constraint, while delayed compaction permits the drift the action is meant to control. Test the mechanism on interrupted, branching, and failure-heavy trajectories, and preserve a recoverable source record for information removed from the active window.

### Measure the task cost of every context-reduction transform

`ERCA-092` · `price-token-reduction-transforms`

Gate minification, comment removal, whitespace stripping, and learned compression on end-task performance before applying them to code shown to the agent. Use a transform only when the token budget genuinely binds, keep repository compression near mild ratios such as ~4x, and evaluate generation and cross-file reasoning alongside completion. A source transformation can preserve program behavior while changing the representation through which the model recognizes intent, boundaries, and relationships.

Directional evidence from Hrubec and Cito ([2026](https://arxiv.org/abs/2606.01326)) found that token savings from minification accompanied lower SWE-bench Verified resolution. A separate empirical investigation by Feng and colleagues ([2026](https://arxiv.org/abs/2604.13725)) measured a more conditional result. At ~4x compression, continuous-latent methods could outperform full context by up to +28.3% BLEU on repository-level generation, consistent with compression suppressing distracting material. Token-level methods converged toward no-context performance at 7-12x on generation tasks, and visual rendering lost cross-file structure at any resolution.

These findings apply to particular models, pipelines, and compression methods. Re-measure each combination rather than treating a ratio or representation as portable. Completion-only validation can miss damage to repository identity, architecture, and dependencies among files. Aggressive compression is especially unsafe when success depends on those relations, and the untransformed source should remain available for recovery and audit.

### Keep permanent context small and verify deferred capabilities

`ERCA-144` · `keep-always-loaded-context-minimal`

Grow always-loaded rules only from demonstrated needs, and move specialized material into path-scoped rules, on-demand skills, or subagents that load when relevant. Compact intentionally before the task reaches its measured degradation region, and periodically remove instructions that newer models no longer require. Every permanent instruction and capability consumes attention as well as tokens, while copied configurations can accumulate overlapping or contradictory guidance.

A directional practitioner account from Böckeler ([2026](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html)) supports incremental rule growth and selective loading. An anecdotal account from Dex Horthy, summarized by Gergely Orosz ([2026](https://rss.xcancel.com/GergelyOrosz/status/2077434907274428914)), describes intentional compaction to stay below a model’s “dumb zone,” but does not measure where that region begins. An illustrative trace dossier supplies an important counterweight: auto-loaded tools received 95%+ of tool-server calls, 165 of 290 traces made no discovery call yet used exposed tools, and in 12 instances the agent loaded one deferred capability before using another, every time. Deferred loading can therefore remove a capability from the agent’s effective repertoire instead of preserving it at lower cost.

Context configurations transfer more reliably within teams than between strangers, and there are no established unit tests that certify them. Test both discovery and subsequent use before deferring a capability. The anecdotal suggestion to reset sessions after appeasement phrases has a different mechanism and support too thin for recommendation, so treat it only as a lead for investigation.

### Budget every contributor and inspect the assembled context

`ERCA-190` · `audit-the-assembled-context-budget`

Enumerate every contributor to the model’s window, including rules, skills, tool definitions, servers that expose tools to the agent, memory, retrieved chunks, and conversation state. Give each category an explicit token budget, record the final ordering and cost, and inspect the assembled context that reaches the model. Independently configured components can each appear reasonable while their combination duplicates instructions, obscures capabilities, violates cache assumptions, or exceeds the measured effective context.

One reported production case from Henry Vu ([2026](https://www.reddit.com/r/LLMDevs/comments/1rfh6p4/what_fills_the_context_window/)) found a key-value cache violation during an assembled-window audit that was costing 10x on inference. That anecdote establishes that such a defect occurred, not how frequently audits find one. A directional practitioner account from Birgitta Boeckeler ([2026](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html)) likewise argues that every configured context interface consumes window space that must be strategically justified and that copied configurations can accumulate contradictions nobody reviews together.

Neither account provides a controlled comparison between budgeted and unbudgeted assembly, and the 10x figure comes from a single incident. An explicit budget is also meaningful only relative to the model’s measured effective context length. Accounting against the advertised maximum can produce a precise inventory while leaving the operating window overloaded. Re-audit whenever models, tools, retrieval policies, or permanent rules change.

## Chapter 14: Cross-session memory, raw traces, and compaction policies

3 taught in the chapter, 6 carried here. 9 practices in total.

The following pointer entries identify the practices taught in Chapter 14, where their full arguments, evidence, and boundaries are developed.

### Retain raw traces and distill them separately

`ERCA-116` · `retain-raw-distill-separately`

Store complete episodic traces and transcripts as immutable ground truth, while treating consolidated memories as derived artifacts that can be inspected and rebuilt. This preserves the original record even as a compact working layer is regenerated for later sessions. Chapter 14 develops the two-layer memory architecture and the lifecycle of raw and distilled information.

### Start cross-session memory with a lightweight transcript store

`ERCA-118` · `light-store-by-default`

Build cross-session memory first around a transcript store using SQLite and full-text search, and inspect the real dependency graph of any framework added to that foundation. This keeps storage, retrieval, and operational assumptions visible before introducing more elaborate infrastructure. Chapter 14 develops the lightweight design and the architectural decisions surrounding heavier memory systems.

### Optimize compaction rules from observed failures

`ERCA-081` · `optimize-compaction-from-failures`

Treat the agent’s compression policy as an artifact that can be evaluated and improved. Identify failures caused by missing or distracting context, revise the natural-language compaction guidance against those cases, and use the resulting examples to strengthen or distill the compressor. Chapter 14 develops this failure-driven process for improving context retention and task performance.

The following compact entries record practices attached to Chapter 14’s mechanism but not taught in full by any chapter.

### Persist explored repository context between reasoning steps

`ERCA-080` · `persist-explored-context`

If repeated repository exploration is consuming a long-running agent’s budget, investigate a working-memory layer that would retain the files, symbols, relationships, and conclusions already examined. Later reasoning steps could resume from that map instead of beginning each query with fresh embedding retrieval, file-system traversal, or graph lookup. Revision identifiers and invalidation signals would need to accompany every retained observation so that a changed repository region triggers renewed exploration.

A directional system report from Pan and colleagues ([2025](https://arxiv.org/abs/2507.19942)) describes this mechanism within Prometheus, where a working-memory context engine operated over a unified repository knowledge graph. The reported result supports the combined architecture: graph retrieval, memory, and multi-agent behavior changed together. It does not isolate the contribution of retained context. The support is therefore too thin to recommend this practice, and this entry should serve only as a lead for investigation in long-horizon navigation or other repeated corpus exploration. Retention can also exchange repeated traversal for coherent staleness. If files change without invalidating the stored map, later steps may reason efficiently from observations that are no longer true.

### Investigate durable references for agent handoffs

`ERCA-099` · `durable-artifact-handoff`

If conversational handoffs are disappearing with sessions or losing important evidence, investigate moving substantial state through a shared task and artifact store. Messages between agents would carry control information and stable references, while recipients would retrieve the underlying plans, outputs, evidence, and traces directly. This arrangement could preserve inspectable state across context replacement or process failure and reduce dependence on the sender’s choice of what to include in a summary.

The evidence is one directional explorer synthesis spanning the long-horizon engineering system described by Chen ([2026](https://arxiv.org/abs/2604.13018)), DeepRare from Zhao and colleagues ([2026](https://arxiv.org/abs/2506.20430)), and MemReader from Kang ([2026](https://arxiv.org/abs/2604.07877)). It identifies durable artifact references as a plausible recovery mechanism, but none of the three works controlled for handoff style by comparing reference-based transfer with transcript transfer. The support is too thin to recommend the practice, so this entry is a lead for investigation rather than an established design rule. A shared store could become another lossy boundary if records lack types, provenance, ownership, or retention rules. It could also accumulate obsolete artifacts until retrieval becomes harder than reconstructing the state.

### Consolidate memory on a schedule and govern the resulting store

`ERCA-109` · `scheduled-typed-consolidation`

Separate fast event acquisition from slower consolidation, then run deduplication, typing, utility assessment, and pruning in scheduled batches. The consolidator should work from retained source records and organize outputs by their operational role, allowing evidence, preferences, decisions, and transient observations to receive different schemas and lifetimes. Batching reduces repeated extraction work and gives the system enough surrounding history to judge whether an item is likely to change future behavior.

One reported Slack production case from April 2026 and the Agentic Context Engineering synthesis by Zhang ([2025](https://arxiv.org/abs/2510.04618)) provide strong support within their described systems for scheduled consolidation and a typed, pruned shared store. Directional evidence from AdaMem, reported by Yan ([2026](https://arxiv.org/abs/2603.16496)), connects batch consolidation with optimizing memory for behavioral utility rather than storage capacity. PersistBench from Pulipaka ([2026](https://arxiv.org/abs/2602.01146)) supports only the need for a forgetting lifecycle; it is a memory-safety benchmark rather than a study of consolidation schedules.

Production illustrations expose both sides of the mechanism. One implementation rebuilt its aggregate model from retained session records and preserved the prior model when consolidation failed. Another shared store accumulated untyped junk when no pruning discipline existed. Scheduled work introduces staleness before the next batch, while repeated rewriting can still corrupt derived memory. Recent raw records must remain retrievable, and consolidation should reconstruct derived state rather than repeatedly edit earlier summaries.

### Define whether each fact is superseded or versioned

`ERCA-117` · `model-time-explicitly`

Assign temporal semantics to every mutable memory field before records begin accumulating. Mark an update as superseding its predecessor when only current state matters, and create a new version when the sequence of changes affects later decisions. Where both the period during which a fact was true and the time at which the system learned it matter, represent those timelines separately with bi-temporal fields.

Directional evidence from a practitioner corpus and temporal knowledge-graph work by Kim and colleagues ([2024](https://arxiv.org/abs/2408.05861)) identifies timeline amnesia as a recurring complaint about vector-only memory. Similarity retrieval alone cannot determine whether two conflicting records describe different periods, a corrected belief, or unresolved evidence. Explicit temporal state gives reconciliation and retrieval code enough information to make that distinction instead of allowing whichever record ranks highest to appear current.

An implementation illustration separates retrieval confidence from truth confidence. Reinforcement can increase the former while age or contradiction reduces the latter, leaving stale but popular material representable without treating it as current truth. Superseded records can likewise remain auditable while losing authority. The evidence remains directional and does not establish that temporal modeling benefits every workload. Bi-temporal schemas add fields, reconciliation rules, queries, and failure cases. Immutable facts and values whose earlier states have no operational use rarely justify that cost.

### Investigate an exportable contract for agent memory

`ERCA-119` · `plan-for-memory-portability`

If a long-lived agent product may compose or replace memory systems, investigate an application-owned contract that could export content together with types, provenance, temporal state, and deletion semantics. Vendor-specific stores would sit behind adapters, while audit tools and replacement implementations could consume the same canonical events. Such a contract could preserve distinctions that opaque embeddings or proprietary operations may make impossible to recover during a later migration.

One anecdotal explorer item, memorywire from Munirathinam ([2026](https://arxiv.org/abs/2606.01138)), establishes that a vendor-neutral wire format has been proposed in response to bespoke framework vocabularies and limited governance surfaces. The proposal was titled “AMP” in its first version and remains indexed under that name in ADS. It does not establish adoption, compatibility across deployed products, or a migration success rate. The support is too thin to recommend the practice, and this entry is only a lead for investigating portability and audit requirements.

A nascent format could itself create compatibility work while products and proposed standards continue changing. An owned canonical event model might reduce dependence on any particular proposal, but it would still require versioning, lifecycle rules, provenance preservation, and tested adapters. This entry is especially likely to age as the interoperability landscape changes.

### Maintain a retrieval substrate for knowledge outside the repository

`ERCA-120` · `tribal-knowledge-substrate`

Create and fund a searchable substrate for product decisions, operating assumptions, architectural rationale, and local conventions that do not appear in source code. Connect its records to owners, provenance, affected systems, and lifecycle state so an agent can retrieve the reasons surrounding a change alongside the relevant implementation. Code search reveals what the repository currently does, while this additional context can expose constraints, rejected alternatives, and obligations that experienced maintainers otherwise carry informally.

A directional vendor-authored study by Dillon ([2026](https://arxiv.org/abs/2605.08112)) reported higher coding-agent decision compliance when the authors’ own product supplied product context. Its evidence covered 8 tasks, 41 weighted decision points, and 16 pull requests with one agent, so it indicates a direction without supporting a general effect size or comparison among alternative substrates. A Microsoft survey of 860 developers by Choudhuri ([2026](https://arxiv.org/abs/2604.07830)) appears in the same explorer synthesis and supports the direction of the practice, but contributes no cataloged figure about this mechanism.

The added substrate inherits every maintenance problem of an agent memory store. Decisions become stale, duplicate explanations diverge, and authoritative-looking records can outlive the systems or policies they describe. Ownership, source links, expiry review, and consolidation are therefore part of its operating cost. Where the repository already captures rationale reliably, a separate store may add more synchronization burden than useful context.

## Chapter 15: Efficient verification interfaces and risk-based human escalation

3 taught in the chapter, 8 carried here. 11 practices in total.

The following pointer entries identify the practices taught in Chapter 15, where their full arguments, evidence, and boundaries are developed.

### Make Verification Cheaper Than Blind Acceptance

`ERCA-153` · `make-verification-cheaper-than-acceptance`

Create tests, executable examples, types, CI gates, sandboxed runs, and inline evidence that let reviewers check an agent’s work with less effort than accepting it on trust. Use these verification surfaces to make correctness directly inspectable at the point of review. Chapter 15 develops the oversight design behind this practice and shows how to apply it.

### Put Friction at the Moment of Acceptance

`ERCA-148` · `target-friction-at-the-accept-loop`

Place cognitive forcing functions at the accept decision, such as requiring reviewers to form a judgment before seeing the agent’s answer or slowing its reveal at consequential checkpoints. Target these interventions at acceleration-mode interactions, where rapid acceptance can displace active scrutiny. Chapter 15 explains how to design and position this friction within the review loop.

### Escalate Flagged Cases to Human Verdict Owners

`ERCA-157` · `escalate-only-flagged-cases`

Direct human attention to anomalies identified by automated monitors, while ensuring a person with real authority retains responsibility for the final verdict. Build the monitoring system in layers, moving from deterministic checks to rubric-based model judgments and trace-aware agent review, with humans calibrating the system. Chapter 15 develops this escalation architecture and its operational requirements.

The following compact entries record practices attached to Chapter 15’s mechanism but not taught in full by any chapter.

### Place human checkpoints at measured failure points with an owned escalation route

`ERCA-106` · `place-human-checkpoints-at-failure-points`

Measure where the workflow confuses real-world entities and where it initiates irreversible mutations, then require human confirmation immediately before those transitions. At each checkpoint, present the evidence-linked reasoning chain and a summary of completed validation. Route the response to a component that records and applies the reviewer’s decision.

A directional explorer synthesis spanning Zhao (2026), Masters ([2025](https://arxiv.org/abs/2510.02557)), and the NIST AI RMF supports connecting evidence-bearing rationales to escalation routes that consume the answer. Sohail ([2026](https://arxiv.org/abs/2604.14723)) likewise supports confirmation at entity-disambiguation and irreversible-mutation points while automation continues elsewhere. He ([2026](https://arxiv.org/abs/2605.23023)) and Khan ([2026](https://arxiv.org/abs/2606.04056)) provide additional directional support for selective human involvement, without establishing an independent speed estimate. The mechanism is containment: a mistaken identity cannot contaminate later work, and a side effect remains stoppable when the decision reaches the reviewer.

Placement based on workflow symmetry or intuition can impose review costs on routine steps or surface the decision after harm has occurred. Failure observations and state-transition boundaries should determine the gate location. Delegation fanout races and double-spends require planner invariants that make those states unreachable, since a runtime approval cannot reliably repair them. This entry covers checkpoint placement; typed action contracts and the broader escalation architecture require separate treatment.

### Design overseer roles to preserve intervention skill

`ERCA-146` · `design-overseer-roles-for-skill-retention`

Give human overseers recurring manual practice and drills built from known automation failures. Rotate them through enough ordinary work to retain procedural fluency, then rehearse diagnosis and recovery under realistic conditions. Treat this practice as part of the operating budget for the automated workflow.

Automation removes the repetitions through which people maintain manual and diagnostic skill. Rare failures also make passive monitoring monotonous, weakening vigilance before an unusual event appears. Bainbridge (1983) offered directional evidence from industrial automation that people can lose skill precisely where the system retains them to diagnose failures and take control. As reliability rises, interventions become less familiar while the remaining cases demand more diagnosis under pressure.

Interface improvements can expose state and evidence, yet they cannot recreate practice that the job has removed. Rotations and drills consume expert time, and an organization must decide which failure classes justify that cost. The evidence predates AI-assisted programming, so its transfer to agent-output review, automated deployment oversight, and software on-call work is analogical. It does not establish a particular drill cadence or prove that any specific rotation schedule improves coding outcomes.

### Calibrate confidence signals before showing them to reviewers

`ERCA-147` · `calibrate-displayed-confidence`

Test an agent’s confidence scores against actual correctness before exposing them, and display only signals that remain calibrated in the intended setting. Where the data supports presentation, prefer a simple nonnumeric indicator. Assess separately whether reviewers possess knowledge that covers the model’s error region before treating their review as a control.

Zhang and colleagues ([2020](https://arxiv.org/abs/2001.02114)) found in controlled experiments that confidence displays changed reliance in the expected direction, while joint accuracy improved only when people contributed complementary knowledge. Local explanations did not improve case-by-case reliance. Li and colleagues ([2024](https://arxiv.org/abs/2402.07632)) found that overconfident AI produced misuse and unconfident AI produced disuse. Their calibration support reduced misuse of an overconfident model while also producing distrust and disuse.

A large-scale null result from Koohestani and colleagues ([2025](https://arxiv.org/abs/2510.22614)) found that generic Platt scaling did not improve confidence-acceptance alignment across 24M interactions; a related study of 153 developers preferred color-coded indicators over numeric ones. That evaluation concerned acceptance behavior in completion-style IDE tools, rather than ground-truth correctness. Revealing poor calibration can also reduce trust across outputs instead of improving discrimination between individual cases. Calibration is therefore a prerequisite for a confidence display, while complementary reviewer knowledge remains a separate requirement.

### Curate displayed suggestions and highlight edit-likely tokens

`ERCA-161` · `curate-what-reviewers-see`

Estimate a suggestion’s utility from interaction data before placing it on the review surface, and withhold suggestions predicted to waste attention. Within suggestions that pass the gate, use a separate edit-prediction model to highlight tokens programmers are likely to change. Keep raw generation probabilities out of this highlighting role.

Mozannar and colleagues ([2023](https://arxiv.org/abs/2306.04930)) retrospectively evaluated selective display using interaction data from 535 programmers using GitHub Copilot. Their CDHF approach withheld suggestions predicted to consume programmer time without sufficient value. In a controlled code-completion study, Vasconcelos and colleagues ([2024](https://arxiv.org/abs/2302.07248)) found that edit-likelihood highlighting reduced task time and directed edits toward highlighted tokens. Highlighted-token survival was 35.3% versus 87.1% for unhighlighted tokens, while generation-probability highlighting improved no measured outcome.

Generation probabilities describe uncertainty in sampling, which does not directly identify code that a programmer should inspect. Acceptance also provides no correctness guarantee, so a display policy trained on acceptance can promote plausible errors or suppress unfamiliar useful code. The evidence concerns completion-sized chunks and does not establish the same effects for full agent diffs. Deploying the approach also requires distinct utility and edit-likelihood models, with training and serving costs for each.

### Shield high-stakes review from deadline pressure

`ERCA-164` · `shield-review-from-time-pressure`

Schedule consequential agent-output review outside deadline pressure whenever the workflow allows it. When a deadline cannot move, reduce the review scope, add another check, or reserve capacity for errors whose severity may grow even if their frequency does not. Plan for deeper reliance on wrong advice rather than assuming pressure merely produces additional mistakes.

In a within-subject experiment with 28 pathology experts, Rosbach and colleagues ([2024](https://arxiv.org/abs/2411.00998)) found that AI integration improved overall performance while producing a 7% commission-error rate. Artificial countdown pressure did not increase the observed frequency of automation-bias errors. It increased their severity: reliance on wrong advice deepened, JAS rose from 0.58 to 0.65, and performance declined more steeply. The result supports protecting high-stakes review from compressed decision time within the experiment’s conditions.

The task involved medical image estimation, and its reviewers worked under an artificial countdown. Software release cutoffs, incident response, and volume-driven queues may create different behavior. With n=28, the experiment may also have lacked power to detect a change in error frequency. The evidence supports the direction of scheduling protection, while leaving its software-specific effect and the value of particular mitigations unresolved.

### Investigate whether live step-level state could support mid-flight steering

`ERCA-170` · `render-agent-actions-as-live-state`

For a conversational data-analysis agent, an exploratory interface could translate generated code into a live sequence of data operations with visible inputs, outputs, and ordering. A user could then inspect or modify an individual operation before later steps depend on it. Such an interface could move some checking into execution while retaining access to the generated code.

Xie and colleagues ([2024](https://arxiv.org/abs/2408.01703)) reported directional evidence from the WaitGPT prototype, including a formative study with N=8 and a user study. Their on-the-fly visualization could support monitoring and steering during structured data-analysis work. The proposed mechanism would expose an early transformation error before it propagates through subsequent state. The evidence does not establish correctness gains or effects for general coding agents.

The support is too thin to recommend this practice, so this entry should serve only as a lead for investigation. A coding system would first need a stable operation-level abstraction, which arbitrary programs may lack. A visual representation could also omit semantics that remain visible in the executable code and could give reviewers an incomplete account of state. Any investigation would need to test whether users detect real errors while keeping the underlying code available for inspection.

### Allocate scarce human review with an adaptive budgeted deferral policy

`ERCA-188` · `treat-human-escalation-as-a-budgeted-online-decision`

Represent each escalation as a contextual choice between agent handling and expert review, constrain those choices by the available review budget, and update the policy as outcomes arrive. The policy can account for the current case and the observed relative performance of each route. This matters when tasks arrive sequentially or their distribution changes, because a confidence cutoff calibrated on an earlier workload preserves an allocation rule after the value of expert intervention has shifted.

Reid and colleagues ([2024](https://arxiv.org/abs/2409.20489)) provide directional evidence from a budget-constrained contextual-bandit formulation, theoretical analysis, and evaluations on real-world datasets. Under their conditions, online deferral remained adaptive where fixed thresholds degraded during sequential arrival and distribution shift. The result supports the direction of the design choice, without establishing how much improvement a live review operation should expect.

The formulation requires measurable outcomes for selected actions and accepts partial feedback about alternatives. Delayed, disputed, or unobservable outcomes can leave the policy with little useful information. It also represents expert capacity as a budget rather than a queue with service times, interruptions, priorities, or fatigue. Review escalation, approval gates, and support-ticket triage may therefore need a separate operational layer when latency and queue behavior determine which cases experts can actually handle.

### Investigate whether verification dominates AI-assisted coding costs

`ERCA-150` · `budget-verification-as-the-dominant-cost`

If a team wants to test whether verification has become its dominant AI-assisted coding cost, it could measure reviewer wait time, test execution, validation work, and repair cycles alongside generation time. The hypothesis is that cheap synthesis can break the former balance between producing code and checking it, allowing proposed changes to accumulate faster than the team can establish their behavior, safety, and fit. Under that hypothesis, schedules based mainly on generated output would omit the work governing when code becomes acceptable.

Sarkar and colleagues ([2022](https://arxiv.org/abs/2208.06213)) offer anecdotal support from a synthesis of experience reports and usability studies that documented effort moving from writing toward evaluating, validating, and repairing generated code. Operational reports illustrate the same possibility by describing human review as a shared serial resource. One integration recorded 4,665 test lines among 11,662 insertions, followed by a verification run in which 156 tests passed and 10 skipped. These examples are illustrations rather than independent evidence.

The support is too thin to recommend planning or staffing around this hypothesis, so this aside should serve only as a lead for local investigation. The source predates coding agents, does not quantify the magnitude of the shift, and cannot establish that verification dominates across teams or tasks. Problem formulation, integration, or other work may remain the larger cost. Any budgeting change would need evidence from the team’s own workflow.

## Chapter 16: Autonomy calibration, provenance, effective gates, and accountability

4 taught in the chapter, 13 carried here. 17 practices in total.

The following pointer entries identify the practices taught in Chapter 16, where their full arguments, evidence, and boundaries are developed.

### Graduate Each Action’s Autonomy from Its Track Record

`ERCA-145` · `graduate-autonomy-per-action-track-record`

Measure approval, correctness, and human modification separately for each action type, then widen autonomy only through explicit transfer-of-control decisions supported by that record. Provide verification surfaces that make agent behavior understandable before granting greater freedom. Chapter 16 develops the graduated-autonomy model, including how evidence and review artifacts support each transition.

### Label AI-Generated Code with Its Provenance

`ERCA-165` · `label-ai-provenance`

Mark AI-generated code explicitly wherever people validate or repair it, using mechanisms such as pull-request labels, commit trailers, or editor badges. Provenance should be visible during review so developers can recognize the origin of the work and engage with it accordingly. Chapter 16 develops this practice and its implications for verification behavior.

### Audit Human Gates for Real Effectiveness

`ERCA-154` · `audit-human-gates-for-effectiveness`

Examine every human approval gate to confirm that the designated person can understand, stop, or change the action and is positioned to exercise meaningful judgment. Replace ceremonial person-gates with institutional oversight whose purpose, authority, and effectiveness are explicit and validated. Chapter 16 develops the criteria and audit approach for making these gates substantive.

### Align Accountability with Actual Human Control

`ERCA-149` · `align-accountability-with-actual-control`

Assign responsibility for agent outcomes only to people who possess the authority, tools, time, and access needed to influence those outcomes. Evaluate deployed systems with actual users to determine whether behavior matches justified expectations and whether responsibility can be traced to a capable, informed decision-maker. Chapter 16 develops this control-accountability alignment and the methods used to examine it.

The following compact entries record practices attached to Chapter 16’s mechanism but not taught in full by any chapter.

### Test plain reliance disclaimers before stronger interventions

`ERCA-160` · `attach-reliance-disclaimers`

A team investigating reliance interventions could place a standing, plain-language warning beside agent advice, such as “this answer may be wrong; verify it before relying,” and compare it with more elaborate designs. The evaluation would separately measure acceptance of wrong advice and rejection of correct advice. It could also distinguish forcing-style interventions that reduce acceptance from interventions that preserve useful reliance. This would make the disclaimer a low-cost experimental baseline, rather than presumed protection.

In a randomized experiment with 400 lay participants, Bo and colleagues ([2024](https://arxiv.org/abs/2412.15584)) reported that the disclaimer shifted both over-reliance and under-reliance in the desired direction across single-shot advice tasks involving LSAT logic and image-based estimation. Other tested formats also discouraged reliance when the advice was useful, and confidence rose most when the reliance decision was wrong. The support is too thin to recommend the disclaimer as a practice. Its favorable result was a single uncorrected p=.04 among roughly thirty reported comparisons, while the paper’s headline conclusion was that the tested interventions generally failed to improve appropriate reliance. This entry should therefore serve only as a lead for investigation in chat interfaces, tooltips, and report footers.

### Decompose oversight metrics before reporting coverage

`ERCA-163` · `measure-oversight-with-decomposed-metrics`

Split oversight measurements into over-reliance, under-reliance, direct human review, agent review, human steering of an agent, and automated checks before calculating coverage. Accepting incorrect output and rejecting correct output impose different costs, so a single accuracy figure can conceal an intervention that merely exchanges one failure for another. Repository dashboards create a similar distortion when every recorded interaction counts as review, even when no person examined the contribution itself.

A survey synthesis by Lai and colleagues ([2021](https://arxiv.org/abs/2112.11471)) found that aggregate human-AI performance measures can hide opposing changes in over-reliance and under-reliance. In a descriptive observational study of 33,596 agent-authored GitHub pull requests, Duma and colleagues ([2026](https://arxiv.org/abs/2605.02273)) found that 61.4% had no recorded review. Among reviewed contributions, 58.8% were reviewed exclusively by agents, while 10.1% received human-only review; a quarter of human comments were agent-steering commands. Those classifications show why a raw reviewed percentage overstates observable human oversight. Neither study establishes which review mode produces better code or fewer defects, and repository records cannot reveal silent maintainer inspection. Report the component measures without converting interaction counts into claims about review quality.

### Allocate review capacity by contributor experience

`ERCA-166` · `scale-review-capacity-to-experience`

Forecast review demand by contributor experience tier as well as by pull-request volume, and assign novice AI-assisted contributors targeted training and adaptive review cycles. An agent can increase a contributor’s production rate without supplying the judgment needed to bound changes, interpret feedback, or verify behavior. The resulting workload appears downstream as larger submissions, longer review exchanges, and more diagnostic work for maintainers. Capacity planning based only on contribution counts misses that transfer.

A descriptive observational study by Ammar Asdaque and colleagues ([2026](https://arxiv.org/abs/2602.23905)) examined 22,953 pull requests from 1,719 vibe coders. Low-experience contributors submitted 2.15x more commits and changed 1.47x more files per pull request. Their contributions received 4.52x more review comments, had 31% lower acceptance, and remained open 5.16x longer. These measured associations support treating contributor experience as a review-load variable in open-source triage, internal platform staffing, and contribution-tier design. They do not establish that training or additional review cycles will reduce the gap. Experience was inferred from profile history, which can misclassify individuals, and the study did not test the proposed interventions. Use tiers for workload forecasts and intervention trials, without treating them as determinations of individual competence.

### Record workflow steps in a hash-chained ledger

`ERCA-142` · `record-steps-in-hash-chained-ledger`

Emit each source, retrieval, transformation, inference, decision, and human attestation as an append-only event linked to its upstream evidence, then incorporate the preceding event’s hash into the next event. Bind confidential inputs by content hash when their contents cannot appear in the record. Verification can then expose edits, insertions, deletions, and reordering because those changes disrupt the links that follow them. The same event history can support recovery and give reviewers a navigable path from a decision back to its recorded inputs.

Nakrani ([2026](https://arxiv.org/abs/2607.09682)) reported a validation of this construction using randomized mutation trials. The tested mutation classes broke chain verification, and the implementation added low per-event overhead. The author presents that detection behavior as a consequence of the construction rather than an unexpected empirical discovery. As an illustration rather than independent evidence, an agent-facing evaluation release has similarly published SHA-256 attestations for its fixtures and reports, binding verdicts to the artifacts used to compute them.

The construction supplies tamper evidence only. An actor controlling storage can recompute the full chain unless its head is periodically anchored outside that actor’s control. Complete verification also depends on faithful capture when events occur. A valid chain establishes the contents and ordering of the recorded history; it cannot establish that omitted events never occurred or that recorded claims were true.

### Restore collective accountability around agent-reviewed work

`ERCA-155` · `rebuild-collective-accountability`

Assign a named human owner to every agent-reviewed merge, expose the review and acceptance record to the team, and retain recurring peer-facing quality rituals. Human peer review carries a social mechanism beyond defect detection: contributors know that colleagues will see both their work and their response to criticism. Replacing that interaction with private agent feedback can remove reciprocity and peer visibility even when the automated reviewer finds useful issues. Visible ownership reconnects the accepting decision to people who share responsibility for the codebase.

A qualitative study by Alami and colleagues ([2025](https://arxiv.org/abs/2502.15963)), based on 16 interviews and focus-group simulations, found that reciprocity and being seen by peers helped move code-quality responsibility from an individual concern toward collective accountability. Participants could not form the same accountability relationship with an LLM reviewer. The result identifies a social channel that teams should examine when agent review displaces peer review; it does not measure escaped defects, review speed, or production incidents. Organizational cultures also differ in how much quality pressure comes from peer visibility. Named ownership and visible records may add ceremony where that mechanism was already weak. Evaluate whether participation, escalation, and acceptance behavior change instead of treating visibility itself as evidence of better outcomes.

### Investigate control and oversight as separate supervision functions

`ERCA-156` · `separate-control-from-oversight`

A deployment team investigating this framework could classify each supervision mechanism by when it would act: control would include permission gates, sandboxes, and real-time blocks, while oversight would include transcripts, ledgers, postmortems, and incentive processes. The inventory could then reveal whether a deployment has mechanisms for both prevention and later detection or remediation. A transcript might support investigation without blocking an unsafe action, while a sandbox might contain an action without explaining its cause. Keeping the categories separate could prevent monitoring coverage from being interpreted as preventive authority.

Manheim and Homewood ([2025](https://arxiv.org/abs/2507.03525)) propose this distinction in a framework and maturity model that maps policy language onto technically feasible supervision mechanisms. Their account also marks deployment conditions in which no existing supervision method would suffice. The support is too thin to recommend the classification as a proven deployment practice because the framework was not tested against safety, incident, or remediation outcomes. It should be treated as a lead for investigation in supervision architecture and regulatory mapping. A team using it would still need to test whether each named mechanism operates under failure conditions, identify uncovered timescales, and state residual risk where prevention remains infeasible. Classification alone could not establish that a deployment is controlled or meaningfully overseen.

### Test comprehension before merging generated code

`ERCA-158` · `require-comprehension-before-merge`

If a team is investigating comprehension gates, it could make generated changes mergeable only after the accepting developer explains the change, completes artifact-specific quality checks, and accepts responsibility for debugging it, with an independent checker evaluating the generating system’s work. Such a gate would make the reviewer’s epistemic access observable. A person who cannot describe the behavior, identify likely failure points, or investigate a defect cannot exercise the oversight mechanisms developed in this chapter, even when formally present in the approval path.

A grey-literature review by Fawzy and colleagues ([2025](https://arxiv.org/abs/2510.00328)) examined 518 firsthand accounts from 101 practitioner sources. It found reports of users skipping quality assurance, shipping generated output unchanged, and asking the same AI to check its own work. One project dossier illustrates a full-text grounding check before agent-produced research could be accepted, but that example supplies no independent outcome evidence.

The support is too thin to recommend comprehension gates. The review is self-reported, selection-biased toward vocal adopters, and documents the failure mode rather than testing whether explain-back, mandatory QA, or debugging ownership reduces failures. This entry is therefore a lead for local investigation. Any trial would need a comprehension test matched to the artifact and measurement of its effects on defects, review cost, and developer learning.

### Investigate an oversight card for each deployed system

`ERCA-159` · `write-an-oversight-card`

If an organization is exploring oversight cards, it could document each system’s oversight architecture in a standard template naming the responsible roles, monitored signals, evidence each role can access, and interventions each role can authorize. Each claimed control could also be mapped to a recognized risk framework and to a concrete test showing that the control operates. The resulting card would expose mismatches such as a role held responsible for an outcome while lacking the information or authority needed to change it.

A framework paper by Gaube and colleagues ([2026](https://arxiv.org/abs/2605.16278)) proposes a standard architecture for effective human oversight and applies it illustratively across domains. A project dossier offers one implementation example: separate documents define architecture, operator triage and emergency powers, system-specific knowledge, agent instructions, and the human attention contract. That example shows how access and authority can be recorded for different audiences, but it does not independently validate the template.

The support is too thin to recommend oversight cards. The framework has not been tested against incident outcomes, and a completed card could merely restate intended governance while the executable path behaves differently. This entry is a lead for investigation, with value depending on audits that compare documented access and intervention authority against operational tests. It complements model and system cards only if those tests reveal whether the named controls actually work.

### Investigate whether experts retain usable override authority

`ERCA-162` · `keep-override-authority-real`

Where a team is investigating human override mechanisms, it could preserve a path through which domain experts can reject a machine recommendation, including when the path requires supervisory sign-off. The relevant mechanism is the combination of independent case information and authority to act on it. Friction may slow an override, but a reviewer who can inspect evidence unavailable to the model and can stop or redirect the decision has a substantive control rather than ceremonial participation.

An observational study by De-Arteaga and colleagues ([2020](https://arxiv.org/abs/2002.08035)) examined decisions at a child-maltreatment hotline. Call workers were significantly less likely to adhere to the machine recommendation when the displayed score was an erroneous estimate of risk, even though departing from it required supervisor approval. Within that setting, experts demonstrably used contextual information to resist erroneous scores. The result provides a counterweight to accounts in which human involvement is assumed to produce only automation bias.

The support is too narrow to recommend this design across agent systems, so this entry remains a lead for investigation. The workers had relevant expertise and independent information about each case. Someone skimming an unfamiliar agent-generated diff may have no comparable signal, and the study does not establish that every override is correct. A local trial would need to verify both epistemic access and effective stopping power before treating override authority as a functioning safeguard.

### Define six dimensions of agent-contribution policy

`ERCA-167` · `write-an-agent-contribution-policy`

For every repository that accepts agent contributions, publish a policy covering disclosure, responsibility, human oversight, licensing, enforcement, and maintainer workload. State within those dimensions which agent-assisted contribution paths are accepted, who remains answerable for submitted work, what review is required, and what happens when contributors breach the rules. Compare the resulting policy with the EU AI Act, NIST AI RMF, ISO/IEC 42001, and any other governance frameworks to which the organization already answers, so agent contributions do not create conflicting obligations.

A comparative policy analysis by Manita and Amari ([2026](https://arxiv.org/abs/2606.14594)) examined six open-source organizations and used documented agent incidents to derive this six-dimension taxonomy. The analysis found fragmented policies and mapped incidents to omitted or ungoverned dimensions. That directional evidence supports using the dimensions as a coverage check: explicit rules make disputed responsibilities, enforcement options, and review costs inspectable before a contribution arrives.

The study covers six organizations, with process tracing for two, and its harmonized tiered framework remains an empirically uncalibrated sketch. The taxonomy should therefore guide policy review rather than function as a complete compliance standard. Each repository still has to define thresholds, enforcement procedures, and acceptable maintainer burden for its own contributors, risks, licenses, and governance environment.

### Set autonomy defaults by task type

`ERCA-168` · `set-autonomy-defaults-per-task-type`

Configure lower default autonomy for identity-defining, human-facing, design-oriented, and individually accountable tasks, while allowing higher defaults for bounded work with low accountability and preserving individual adjustment. Task-sensitive defaults place the initial delegation boundary closer to where responsibility and professional judgment already sit. They can reduce the pressure to surrender control on consequential work while leaving routine, well-scoped work available for broader automation.

A mixed-methods study of 448 professional developers by Choudhuri and colleagues ([2026](https://arxiv.org/abs/2607.00533)) found that task accountability was associated with lower odds of allowing AI to act on the developer’s behalf. Stated acceptance was also lowest for identity-defining and human-facing work. These results support the direction of differentiated defaults, although they do not establish the effects of deploying any particular configuration. Acceptance also increased with AI experience and risk tolerance, indicating that one fixed setting will fit users differently and may age as experience changes.

The study came from a single company, Microsoft, and measured stated acceptance rather than observed behavior in deployed workflows. Task-type defaults can initialize policy, but they cannot establish the per-action track record required by the chapter’s autonomy ladder or replace it. Teams should permit narrower individual settings, monitor actual behavior and outcomes, and revisit classifications as tools, experience, and local accountability norms change.

### Review objective terms and weights as policy

`ERCA-180` · `treat-objective-weights-as-reviewed-policy`

Place an optimizer’s objective definition and priority weights under code-like review by the stakeholders whose interests they encode. Represent concerns such as fairness among competing consumers as explicit objective terms, and validate the resulting scheduler on the worst real oversubscribed periods rather than average demand. When a weighted index refines declared priority bands, require each adjacent band gap to exceed the sum of all secondary feature weights, with secondary features normalized to [0,1]. This construction makes declared priority dominate while permitting machine reordering within a band.

A head-to-head algorithm comparison by Gómez de Castro and Yáñez (2003) found that neighborhood search and genetic algorithms performed comparably, while objective definition and priority assignment determined the resulting schedules and required stakeholder discussion. In a separate historical validation, Claudet and colleagues ([2021](https://arxiv.org/abs/2111.11628)) encoded a heuristic for balancing mission satisfaction in Delta-MILP and evaluated schedules on the most oversubscribed weeks of 2016 and 2018 Deep Space Network demand. The directional result shows how equity and throughput become visible and tunable when represented in the objective.

Fairness definitions such as max-min and proportional fairness remain policy choices. The Delta-MILP evaluation concerned one network and reported no production deployment, while solver rankings from 2003 do not transfer to current systems. A single design used a 0.25 band gap against a 0.24 secondary-weight sum; those constants are illustration, not a measured threshold. Every deployment must recompute the dominance gap from its own weights and test whether the reviewed objective produces acceptable local outcomes.

### Gate optimizer output behind developer review

`ERCA-185` · `gate-optimizer-output-behind-human-review`

Require a developer to approve recommendations from metric-optimizing search before they can change code or configuration, and keep score improvement out of the merge criteria. Optimization explores candidates according to information encoded in its objective, while review tests concerns the objective may omit, such as architectural fit, ownership boundaries, and maintenance consequences. A single-organization case study by Schröder and colleagues ([2021](https://arxiv.org/abs/2102.00701)) examined search-based re-modularization at Adyen across 5.5M+ LOC. Developers valued the recommendations overall but often considered the suggested target modules wrong. The study therefore gives directional support for treating the optimized score as a candidate signal while reserving acceptance for the people responsible for the artifact.

Apply the same separation to LLM-generated refactors, dependency-update bots, configuration tuning, and agent patch pipelines: automation proposes and ranks; an authorized reviewer decides whether the result enters the system. The project dossier illustrates this separation through metric-improving moves that created fresh modules, but that account is corroboration rather than independent evidence. The study does not establish that the modularity metric was invalid, that developer preference measures architectural truth, or that human review will reliably catch every harmful change. Its finding concerns acceptance within one organization, and recommendation quality was partly tied to developer perception. Review also consumes scarce attention, so the gate needs enough context, authority, and capacity to make rejection or revision operationally meaningful.

## Chapter 17: Agent topology selection and dynamic task allocation

4 taught in the chapter, 5 carried here. 9 practices in total.

The following pointer entries identify the practices taught in Chapter 17, where their full arguments, evidence, and boundaries are developed.

### Fix recurring failure classes through system structure

`ERCA-044` · `fix-failures-structurally-not-prompts`

When a failure class persists, redesign the agent system around it by strengthening verification, clarifying communication protocols, specializing roles, or changing the conversation topology. This practice turns repeated failures into improvements to the harness instead of accumulating increasingly brittle prompt patches. Chapter 17 develops the structural interventions and design choices involved.

### Gate multi-agent fan-out with a single-agent baseline

`ERCA-093` · `single-agent-baseline-gate`

Establish a measured single-agent baseline before introducing additional agents, then evaluate orchestration against that reference on the same representative tasks. The baseline makes success, cost, and added coordination complexity visible, so topology decisions rest on observed performance. Chapter 17 explains how to build and apply this gate when selecting an agent configuration.

### Match the orchestration topology to the task

`ERCA-107` · `match-topology-to-task-shape`

Choose the communication and control structure that fits how the work decomposes, how information moves, and where integration occurs. This practice aligns pipelines, orchestrator-worker arrangements, hierarchies, and shared-state designs with the task shape they must support. Chapter 17 develops topology selection as an architectural decision rather than a generic orchestration preference.

### Schedule work through dynamic task graphs

`ERCA-101` · `dynamic-task-graphs`

Represent work as an evolving graph of dependencies, releasing independent branches as soon as their prerequisites are satisfied and bounding each step’s execution. This gives the scheduler a live model of what can proceed, what must wait, and where concurrency is available. Chapter 17 develops the mechanisms for building and operating these dynamic graphs.

The following compact entries record practices attached to Chapter 17’s mechanism but not taught in full by any chapter.

### Oversee multi-agent execution at node, edge, and path levels

`ERCA-059` · `oversee-mas-as-graph`

If investigating graph-level oversight, represent each live multi-agent run as a changing graph and give a separate overseer access to its nodes, edges, and paths under pre-written intervention policies. This representation could expose failures distributed across several interactions, including coordinated behavior, latent exploit paths, and cascades that remain plausible when each message is inspected alone. The overseer could associate an anomaly with the interactions that produced it and select only the responses permitted by policy.

He and colleagues ([2025](https://arxiv.org/abs/2505.24201)) reported graph-level anomaly detection with explainable root-cause attribution in two case studies involving Magentic-One and an email assistant. Those cases establish that the design has been demonstrated, but they provide no quantitative detection rates. The support is too thin to recommend the practice; this entry is a lead for investigation in systems whose interaction topology and telemetry are already structured. An LLM-powered overseer inherits model errors and may itself be manipulated. Missing identities or relationship types can also make the graph appear more complete than the underlying observations warrant. Any experiment therefore needs bounded intervention rules and separate evaluation of detection, attribution, false alarms, and overseer failure.

### Express agent roles through configuration and prompts

`ERCA-102` · `roles-in-config-not-code`

For an exploratory design, move task-specific role definitions into reviewed, versioned configuration or prompts while keeping identity, messaging, permissions, and lifecycle behind stable runtime interfaces. Roles could then form around the task without adding a subclass or dispatch branch for every specialization. This arrangement may reduce coupling between coordination policy and orchestration machinery, allowing role declarations to change alongside models and workloads.

One explorer synthesis points in this direction across “From Skills to Talent” ([2026](https://arxiv.org/abs/2604.22446)), a 2-D agent design-pattern framework ([2026](https://arxiv.org/abs/2605.13850)), and Wu’s AutoGen ([2023](https://arxiv.org/abs/2308.08155)). Operational dossiers also illustrate systems that prohibit hardcoded role names or express orchestration roles as prompt programs, but those examples are corroboration rather than independent evidence. None of the cited studies measures the cost of configuration-driven roles against class-driven roles. The support is therefore too thin to recommend this practice; it is a lead for investigation in multi-agent frameworks and orchestration products. Configuration can reproduce the same rigidity when declarations are scattered, unreviewed, or unversioned. Code-level types also remain necessary where a role corresponds to an enforceable capability or security boundary.

### Blind review lanes and conceal interim tallies

`ERCA-103` · `blind-review-lanes`

If testing a multi-reviewer topology, anonymize each reviewer’s lane and withhold votes or scores until the synthesis stage. Authorship cues can encourage reviewers to favor their own contributions, while visible early tallies can make later judgments converge before reviewers have produced independent observations. The orchestrator could retain provenance for audit while removing identity and vote state from the context shown to reviewers.

Directional explorer evidence from Tian ([2025](https://arxiv.org/abs/2509.23537)) links anonymized lanes and hidden interim tallies with reduced self-voting, herding, and premature consensus in multi-agent debate. Chun’s empirical analysis of multi-agent debate ([2025](https://arxiv.org/abs/2503.12029)) supports the same direction, although no quantitative result from that work is carried into this catalog. Both sources are frontier work. Their support is too thin to recommend blinding as a general review design, so this entry is a lead for investigation. The prerequisite question remains whether debate or multiple reviewers outperform one strong review on the target workload. If that comparison fails, blinding only adds routing, logging, and synthesis complexity. Experiments also need to check every information channel through which identity or evolving consensus could leak, while preserving enough provenance for incident analysis.

### Activate blackboard writes and test a diversity check

`ERCA-108` · `active-blackboard-with-diversity`

For an exploratory blackboard topology, make each relevant write trigger a notification or broadcast, and add a diversity mechanism that can introduce a different search direction when contributors deadlock. Active delivery could let participants react to shared-state changes without polling, while a diversity check could interrupt repeated contributions that no longer expand the search. This variant applies specifically to teams working over shared, evolving state.

Wei’s ARIADNE work ([2026](https://arxiv.org/abs/2605.02431)) presents a blackboard-driven search with active writes and a deadlock-breaking diversity check. Shang’s Theater of Mind proposal ([2026](https://arxiv.org/abs/2604.08206)) argues that static memory pools and passive messaging can lead to cognitive stagnation and homogeneous deadlocks during extended execution. The latter is a single-author architecture proposal, and ARIADNE is a competitive-programming search method. Neither study compares the proposed arrangement with a passive shared store or measures the failure the pattern is intended to prevent. The evidence is too thin to recommend the practice; this entry is a lead for investigation in blackboard systems, shared scratchpads, and collaborative agent state. Notifications create additional traffic, and diversity interventions consume inference and coordination capacity. Evaluation must determine whether they improve progress enough to justify those costs without repeatedly disrupting useful convergence.

### Repair the earliest supported root cause

`ERCA-048` · `repair-root-cause-not-last-step`

When investigating a failed run, identify the earliest error supported by the trajectory, restore or rerun from that point, and supply corrective feedback aimed at the classified failure. An upstream mistake can shape every later observation and decision, so editing the final answer may leave the generating error intact. Targeted repair could prevent the same false premise from propagating through a repeated execution.

Zhu and colleagues ([2025](https://arxiv.org/abs/2509.25370)) reported that AgentDebug’s root-cause isolation and targeted feedback outperformed retry-from-scratch baselines on trajectories from ALFWorld, GAIA, and WebShop. This is directional evidence from one author group that constructed AgentErrorBench, defined the taxonomy, built the debugging system, and evaluated it. It has no independent replication and does not establish effectiveness for repository-scale coding. The support is too thin to recommend this method as a general retry policy; it is a lead for investigation in agent harnesses and human-assisted run repair. The approach also depends on reliable classification across memory, reflection, planning, action, and system errors, plus the ability to restore relevant state. When the earliest cause is ambiguous, state cannot be reconstructed, or several independent errors coexist, a targeted rerun may preserve the wrong diagnosis.

## Chapter 18: Cost-aware fleet scheduling and model routing

3 taught in the chapter, 8 carried here. 11 practices in total.

The following pointer entries identify the practices taught in Chapter 18, where their full arguments, evidence, and boundaries are developed.

### Recompute schedules cheaply and ship the incumbent

`ERCA-171` · `re-decide-cheaply-ship-the-incumbent`

Treat scheduling as a continuing control loop that periodically recomputes from current state while using inexpensive decisions between full solves. Preserve in-flight work, cap optimization time, and deploy the best valid schedule available when the cap arrives so planning remains responsive to change. Chapter 18 develops this approach to practical, stability-aware fleet scheduling.

### Route each task to the cheapest sufficient model

`ERCA-187` · `route-work-to-the-cheapest-sufficient-model`

Estimate model cost and task performance explicitly, then assign each request to the least expensive model expected to meet the declared objective. Update those routing estimates from outcome feedback while retaining a dependable fallback when observations are sparse. Chapter 18 develops the static and learning-based machinery for budget-aware model selection.

### Replay recorded traces before changing dispatch policy

`ERCA-191` · `replay-traces-before-policy-changes`

Evaluate proposed scheduling policies by replaying the same recorded arrivals, priorities, durations, outcomes, and review results through each contender. Holding the workload fixed makes policy comparisons interpretable and gives simple baselines and constructed test cases a consistent role in validation. Chapter 18 develops the replay protocol used to assess scheduling changes before deployment.

The following compact entries record practices attached to Chapter 18’s mechanism but not taught in full by any chapter.

### Formalize work as constraints and solve the allocation globally

`ERCA-179` · `formalize-work-as-constraints-and-solve-globally`

Represent every request through one versioned schema of required resources, time windows, budgets, priority, and weighted preferences, then rerun a search or integer-programming solver over the complete workload whenever conditions change. A common formalism makes requests comparable, allowing the solver to trade preferences across the fleet instead of preserving an arbitrary queue order. Keep coefficients, priorities, and constraints in a reviewed judgment layer. Treat solving as transport, and retain bounds, optimality gaps, and timing logs so each allocation can be reproduced and appealed. When no solution exists, report an irreducible infeasible subsystem that identifies the declared rules in conflict.

One reported operational case from Johnston and Miller (1990) describes SPIKE combining heterogeneous temporal constraints and preferences for Hubble long-range scheduling after initial on-orbit checkout. Lampoudi and colleagues ([2015](https://arxiv.org/abs/1503.07170)) describe reservations converted into a discretized integer program that could be rerun online, supported by computational verification. Szeider ([2024](https://arxiv.org/abs/2501.00539)) offers a more recent prototype in which a language model edits declared constraint models while deterministic solvers consume them, although its authors characterize the experiments as non-rigorous benchmarks. These cases establish feasibility, not superiority over manual scheduling. Finer discretization also improves temporal fidelity while increasing solver cost, and a globally solved model can still encode the wrong objective perfectly.

### Design rescheduling as a closed-loop algorithm

`ERCA-181` · `design-the-online-rescheduling-loop`

Choose the scheduling horizon, re-solve time-step, hybrid trigger policy, and churn penalty as explicit parts of the online scheduler. Run periodic decisions alongside event-triggered reactions, implement only the near-term portion of each plan, observe the resulting state, and solve again. Add objective terms or constraints that price unnecessary changes to announced or prepared work. Such additions can worsen the apparent quality of one open-loop solution while improving the sequence that ultimately executes.

The mechanism follows the model-predictive-control view of scheduling: every solve affects the state encountered by later solves, so plan stability and recovery belong in the objective. A classification and chemical-production case study by Gupta and colleagues (2016) provides directional evidence that event-only rescheduling has systematic shortcomings, that horizon and time-step are first-class choices, and that nervousness penalties can improve closed-loop behavior. It does not supply a universal cadence or penalty formula.

Judge the design from executed traces, including churn, abandoned preparation, missed deadlines, and recovery cost, rather than from isolated solver objectives. Horizon length, step size, trigger sensitivity, and stability weights remain empirical choices for agent queues, CI pipelines, and autoscaling systems. The evidence comes from chemical production, and its authors leave important questions about closed-loop schedule quality open.

### Investigate threshold-gated probing when uncertainty is costly

`ERCA-182` · `probe-only-above-an-uncertainty-threshold`

If you investigate this option, configure a bounded profiler, canary, dry run, or classifier to run only when a task’s declared upper cost bound crosses a threshold; tasks below it would proceed without probing. The proposed mechanism prices information gathering against execution. A probe can improve dispatch when uncertainty could change the chosen route, yet it consumes time and capacity even when the original route would have succeeded.

A theoretical result by Dürr and colleagues ([2017](https://arxiv.org/abs/1709.02592)) proves that a threshold policy is optimal for deterministic algorithms inside an adversarial single-machine model with unit test cost. Within those assumptions, both always testing and never testing are worse. That result supports the shape of a threshold rule, while offering no production threshold for agent pipelines.

The support is too thin to recommend this practice; this entry is a lead for investigation. Real classifiers and canaries have variable costs, imperfect observations, parallel execution, and consequences that differ from the paper’s job model. Any trial would need workload-specific estimates of probe cost, uncertainty, and downstream failure cost, plus comparison against simple always-probe and never-probe baselines. The theorem’s threshold should not be imported into a fleet configuration.

### Split scheduling between global coordination and local workers

`ERCA-184` · `split-fleet-scheduling-into-global-and-local-levels`

Assign fleet-wide allocation and per-worker ordering to separate scheduling levels. The global coordinator should distribute work using coverage, available capacity, urgency, and conflicts across all workers. Each worker should then order and adapt its assigned tasks at its own timescale. Compute local policies independently where possible, resolve collisions in the upper layer, and keep the allocator and local planner behind swappable interfaces.

This split separates two computational problems. Local planning handles uncertain execution and immediate state for one worker; global coordination prevents individually reasonable plans from competing for the same scarce task, time window, or dependency. Two simulation studies provide directional support. Zhang and colleagues (2023) evaluated a two-level telescope-array framework with global allocation across sites and local dispatch within each site. Choudhury and colleagues ([2020](https://arxiv.org/abs/2005.13109)) evaluated SCoBA on multi-drone delivery and conveyor sorting, computing worker policies separately before coordinating conflicts. Its expected-optimality and completeness results hold only under the paper’s assumptions.

Neither study concerns a production software-agent fleet. The planner must know or estimate task-completion uncertainty and time windows, and the weights joining load, urgency, coverage, and local conditions remain domain-specific. Small systems with little contention may gain little from the extra coordination boundary, while poorly aligned global and local objectives can create oscillation or idle capacity.

### Investigate the allocation layer as a shared audited component

`ERCA-192` · `audit-the-allocation-layer`

If a shared queue and contended resources make allocation failures recurring, investigate separating execution, planning, and fleet-wide optimization into three named levels. The audit would enumerate claim order, pool sizing, model-tier routing, merge slots, interrupt policy, and review bandwidth, then distinguish measured choices from inherited defaults. It would also trace failures that worker improvements cannot repair, including selecting the wrong task, colliding file sets, serializing independent chains, draining execution capacity during an interrupt, and leaving completed work behind one reviewer.

Reported observatory systems provide directional analogies. Bellm and colleagues ([2019](https://arxiv.org/abs/1905.02209)) and Naghib and colleagues ([2019](https://arxiv.org/abs/1810.04815)) describe scheduling policy as a named component with an explicit objective. Claudet and colleagues ([2021](https://arxiv.org/abs/2111.11628)) describe centralized allocation of contended Deep Space Network resources. Separate integer-programming schedulers appear in the ALMA case reported by Solar and colleagues (2016), the network formulation of Lampoudi and colleagues ([2015](https://arxiv.org/abs/1503.07170)), and the relay scheduler of Ju and colleagues (2025). Singer and colleagues ([2025](https://arxiv.org/abs/2502.17560)) later report a shared multi-mission toolkit.

The support is too thin to recommend the three-level split or a shared allocation product; this entry is a lead for investigation. Every independent source concerns observatories, and the transfer to software agents is interpretive. Small single-project systems may not have stable boundaries between these levels, while a declarative shared component introduces governance and integration costs of its own.

### Route cheap-first and escalate through an uncertainty gate

`ERCA-100` · `cost-cascade-routing`

Start each eligible task on the cheap route and escalate to a stronger model or quorum only when a calibrated uncertainty signal fires. Record tokens, dollar cost, and latency for every step, and preserve missing measurements as unknown. A zero would make an unmeasured weak route appear free and distort both dispatch and evaluation. A controlled comparison reported by Chang ([2026](https://arxiv.org/abs/2604.12262)) found that confidence-gated cascades could beat always-on strong-model fan-out on both cost and quality; the result applies to that design and workload.

Once outcomes accumulate, update the gate as a budget-constrained bandit using Thompson sampling on reward-per-cost. Define one arm for each task-class and model-tier pairing. For each arm, maintain an outcome distribution whose reward is a versioned operational event, such as merged and not reverted within N days, and charge the observed dollar cost of that dispatch. Thompson sampling draws from those distributions and chooses among arms that remain within budget, allowing feedback to change routing as models and workloads drift. Cayci and colleagues ([2020](https://arxiv.org/abs/2003.00365)) give directional theoretical support for bandits with random, correlated, heavy-tailed, or negative cost-reward pairs. Li ([2025](https://arxiv.org/abs/2502.02743)) provides directional benchmark evidence for preference-conditioned online routing.

When data are thin, retain the chapter’s static table as the fallback, making learned routing advisory until its reward correlates with an external outcome. Calibration remains mandatory. Online exploration spends real production budget, code-task feedback is delayed and noisy, and theoretical guarantees depend on moment conditions that may fail.

### Investigate decision logging for later selection-effect modeling

`ERCA-183` · `log-scheduling-decisions-for-selection-effect-modeling`

A fleet investigating selection effects could record every scheduling choice at decision time, including the eligible items, the winner, the active policy, relevant state, and the stated routing reason. That record would preserve how the scheduler shaped the observed workload: downstream measurements reflect which work was attempted, expedited, or excluded. A shared reporting schema could also make decisions comparable across cooperating fleets, while open-source scheduler packages could expose the mechanisms that produced those records.

Bellm and colleagues ([2019](https://arxiv.org/abs/1907.07817)) explicitly proposed decision-reason logging, shared schedule-reporting schemas, and open-source schedulers in an Astro2020 position paper. This is anecdotal support from community recommendations informed by operational experience. It establishes that practitioners identified these practices as useful leads, but supplies no controlled evidence that they improve later bias correction or coordination. The support is too thin to recommend the practice, so this entry should be treated only as a lead for investigation.

Even under investigation, the log would preserve inputs for modeling rather than remove selection bias itself. Reasons could be incomplete or rationalized after the fact unless captured automatically when the decision occurs. The paper also does not quantify storage, schema maintenance, implementation discipline, or the minimum fields required for a useful analysis.

### Pick the algorithm with short pilots, then commit the long budget

`ERCA-186` · `pilot-to-pick-the-algorithm-then-commit-the-budget`

Use short-budget pilots to select among candidate optimization algorithms, then give the selected algorithm the longest affordable execution budget. The pilots spend scarce experimental capacity on the choice that most strongly separated results in the available study. Once that choice is made, concentrating the remaining budget avoids repeatedly dividing the final run among alternatives or assuming that a modest extension will repair a weak selection.

Di Pompeo and Tucci ([2022](https://arxiv.org/abs/2212.08385)) conducted a controlled comparison of 3 algorithms x 3 budgets x 31 repetitions, with hypothesis testing, on model-based refactoring. Within those experiments, imposing a time budget considerably deteriorated Pareto-front quality. Increasing the budget from 15->30->60 min rarely produced significant differences, while algorithm choice produced significant differences at every budget. Their resulting protocol was to use short experiments to choose the algorithm and then commit the longer budget to it.

The evidence covers two model-based case systems, TTBS and CoCoME, with model-level refactoring objectives. It does not establish that the observed algorithm rankings, including PESA2 quality and NSGA-II speed, transfer to hyperparameter tuning, agent-strategy selection, or fuzzing. The protocol also depends on short-run results predicting long-run performance. Different warm-up behavior or scaling curves can reverse the ordering, so pilot metrics should be fixed before comparison and checked for relevance to the committed run.
