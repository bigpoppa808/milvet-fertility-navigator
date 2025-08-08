-- Sample Stories for Military Fertility Navigator
-- These are realistic but fictional stories based on common military fertility experiences

-- Insert sample stories
INSERT INTO stories (id, user_id, title, content, consent_level, is_anonymous, service_branch, story_type, emotional_tone, created_at, approved_at) VALUES

-- Story 1: Army couple's IVF journey
('550e8400-e29b-41d4-a716-446655440001', NULL, 'Our Three-Year Journey to Parenthood', 
'After three deployments and countless failed attempts, my husband and I finally decided to pursue IVF. The military healthcare system was supportive, but navigating Tricare coverage while stationed overseas was challenging. We had to coordinate treatments around his deployment schedule and my training rotations. The emotional toll was immense - dealing with hormone treatments while he was in Afghanistan was one of the hardest things I''ve ever done. But after two failed cycles and one successful transfer, we welcomed our daughter. The military community rallied around us, and our command was incredibly understanding about medical appointments. For any military couples considering fertility treatments, my advice is to start the paperwork early and don''t be afraid to advocate for yourselves with Tricare.', 
'public', false, 'Army', 'success_story', 'hopeful', '2024-01-15 10:30:00', '2024-01-16 09:00:00'),

-- Story 2: Navy spouse dealing with miscarriage
('550e8400-e29b-41d4-a716-446655440002', NULL, 'Finding Strength After Loss', 
'I lost three pregnancies during my husband''s submarine deployment. Being alone during each miscarriage while he was underwater for months at a time was devastating. The military family support system became my lifeline. Other Navy spouses who had experienced similar losses reached out, and the chaplain provided incredible emotional support. What I learned is that grief doesn''t follow a timeline, and it''s okay to not be okay. The military healthcare providers were compassionate, but I had to be my own advocate when it came to getting proper testing done. We eventually discovered I had a clotting disorder that was treatable. Now pregnant with our rainbow baby, I want other military spouses to know they''re not alone in this journey.', 
'public', true, 'Navy', 'loss_story', 'resilient', '2024-02-03 14:20:00', '2024-02-04 11:15:00'),

-- Story 3: Air Force male infertility
('550e8400-e29b-41d4-a716-446655440003', NULL, 'Breaking the Silence: A Male Perspective', 
'As an Air Force pilot, I always thought I was invincible. Discovering that I was the reason we couldn''t conceive was a blow to my ego and identity. Male factor infertility isn''t talked about enough in military circles. The testing process was uncomfortable, and I felt isolated because most fertility discussions focus on women. My wife was incredibly supportive, but I struggled with feelings of inadequacy. We ended up needing ICSI, and I had to take time off for procedures, which meant explaining to my squadron why I needed medical leave. The stigma around male fertility issues in the military is real, but talking about it openly helped other guys in my unit realize they weren''t alone. We now have twin boys, and I''ve become an advocate for male fertility awareness in the military.', 
'public', false, 'Air Force', 'awareness_story', 'determined', '2024-02-20 16:45:00', '2024-02-21 08:30:00'),

-- Story 4: Marine Corps adoption journey
('550e8400-e29b-41d4-a716-446655440004', NULL, 'Our Path to Adoption', 
'After years of fertility treatments that didn''t work, my husband and I decided to pursue adoption. The military lifestyle actually presented unique challenges - frequent moves, deployments, and security clearances all complicated the adoption process. Some agencies were hesitant to work with military families because of the instability. However, we found an agency that specialized in military adoptions and understood our lifestyle. The process took two years, including a failed match that broke our hearts. But when we got the call about our son, everything fell into place. The Marine Corps community embraced our adoption journey, and our command was flexible with leave policies. Adoption isn''t the consolation prize - it''s just a different path to the same destination. Our son is now 3, and we couldn''t imagine our family any other way.', 
'public', false, 'Marine Corps', 'success_story', 'grateful', '2024-03-10 12:00:00', '2024-03-11 10:45:00'),

-- Story 5: Coast Guard egg freezing
('550e8400-e29b-41d4-a716-446655440005', NULL, 'Preserving My Future While Serving', 
'At 28, I was focused on my Coast Guard career and not ready for children. But watching friends struggle with fertility after 35 made me think about egg freezing. The process wasn''t covered by Tricare at the time, so I paid out of pocket - about $15,000 total. Coordinating the daily injections and monitoring appointments with my duty schedule was challenging, especially during a busy hurricane season. My command was supportive once I explained the medical necessity. The retrieval went well, and I was able to freeze 18 eggs. Three years later, when I was ready to start a family with my husband, we used those eggs for IVF. Our daughter is now 18 months old, and I''m so grateful I made that investment in my future. I encourage all military women to consider their fertility timeline and explore options like egg freezing if it makes sense for their career goals.', 
'public', false, 'Coast Guard', 'preventive_story', 'empowered', '2024-03-25 09:15:00', '2024-03-26 14:20:00'),

-- Story 6: Space Force surrogacy journey
('550e8400-e29b-41d4-a716-446655440006', NULL, 'Our Surrogacy Experience', 
'After multiple pregnancy losses due to a uterine condition, our doctor recommended surrogacy. As one of the newer Space Force families, we weren''t sure how our command would handle the unique aspects of surrogacy. The legal and medical coordination was complex, especially with our frequent relocations. We found an amazing surrogate through a military-friendly agency. The emotional journey was intense - watching someone else carry our biological child while dealing with the grief of not being able to carry myself. Tricare coverage for surrogacy was limited, so we had significant out-of-pocket expenses. Our Space Force community was incredibly supportive, even though surrogacy was new territory for everyone. When our son was born, it felt like a miracle. The experience taught us that family comes in many forms, and sometimes you need help from others to achieve your dreams.', 
'public', true, 'Space Force', 'success_story', 'grateful', '2024-04-08 11:30:00', '2024-04-09 13:45:00');

-- Insert sample community posts
INSERT INTO community_posts (id, user_id, title, content, category, tags, likes_count, replies_count, is_pinned, is_moderated, created_at, updated_at) VALUES

-- Post 1: Tricare coverage question
('660e8400-e29b-41d4-a716-446655440001', NULL, 'Tricare Coverage for IVF - Recent Changes?', 
'Has anyone had experience with the recent Tricare policy changes regarding IVF coverage? I''m hearing conflicting information from different MTFs. My PCM says I need three documented cycles of failed attempts, but the fertility clinic says it''s now two cycles. Also, does anyone know if the coverage extends to frozen embryo transfers? My husband is deploying soon, and we''re trying to figure out timing. Any recent experiences or official documentation would be super helpful!', 
'insurance_coverage', ARRAY['tricare', 'ivf', 'coverage', 'policy'], 15, 8, false, false, '2024-07-15 14:30:00', '2024-07-15 14:30:00'),

-- Post 2: Deployment timing concerns
('660e8400-e29b-41d4-a716-446655440002', NULL, 'Starting IVF Before Deployment - Advice Needed', 
'My husband deploys in 4 months, and we''re considering starting our first IVF cycle. For those who''ve been through this, is it realistic to complete a full cycle before he leaves? What happens if we need multiple attempts? I''m also worried about managing hormone treatments and appointments while he''s gone. Should we wait until he returns, or is it better to start now? The uncertainty is killing me, and I feel like we''re losing precious time.', 
'treatment_timing', ARRAY['deployment', 'ivf', 'timing', 'advice'], 23, 12, false, false, '2024-07-18 09:45:00', '2024-07-18 09:45:00'),

-- Post 3: Male factor infertility support
('660e8400-e29b-41d4-a716-446655440003', NULL, 'Male Factor Infertility - Breaking the Silence', 
'Guys, we need to talk about male factor infertility more openly. I''ve been dealing with low sperm count and motility issues, and I felt so isolated until I started opening up about it. The military culture of ''toughing it out'' doesn''t help when you''re dealing with something that affects your sense of masculinity. Anyone else struggling with this? What treatments have worked for you? My wife has been amazing, but I know this is hard on her too. Looking for a battle buddy who gets it.', 
'male_fertility', ARRAY['male_factor', 'support', 'infertility', 'mental_health'], 31, 18, false, false, '2024-07-20 16:20:00', '2024-07-20 16:20:00'),

-- Post 4: PCS and fertility treatment coordination
('660e8400-e29b-41d4-a716-446655440004', NULL, 'PCS Orders Mid-Treatment - How to Handle?', 
'Just got PCS orders to move from Bragg to Lewis in 3 months, right in the middle of our fertility treatments. Has anyone dealt with transferring care between MTFs during active treatment? I''m worried about continuity of care and having to start over with a new team. Also concerned about the stress of moving affecting our treatment success. The timing couldn''t be worse. Any tips for making this transition smoother?', 
'pcs_moves', ARRAY['pcs', 'treatment', 'continuity', 'stress'], 19, 14, false, false, '2024-07-22 11:10:00', '2024-07-22 11:10:00'),

-- Post 5: Adoption in military families
('660e8400-e29b-41d4-a716-446655440005', NULL, 'Military Adoption - Agency Recommendations?', 
'After several failed IVF cycles, we''re exploring adoption. Looking for recommendations for adoption agencies that work well with military families. We''ve heard some agencies are hesitant because of frequent moves and deployments. Also wondering about the home study process - how does it work with military housing? And what about adoption leave policies? Our command seems supportive but admits they don''t have much experience with adoption cases.', 
'adoption', ARRAY['adoption', 'agencies', 'military_friendly', 'home_study'], 27, 16, false, false, '2024-07-25 13:55:00', '2024-07-25 13:55:00'),

-- Post 6: Mental health during fertility journey
('660e8400-e29b-41d4-a716-446655440006', NULL, 'Therapy and Mental Health Support', 
'The emotional toll of infertility is something I wasn''t prepared for. Between the hormone treatments, failed cycles, and my husband''s deployment stress, I''m struggling. Has anyone used Military Family Life Counselors (MFLCs) for fertility-related mental health support? Or found good therapists who understand both military life and fertility challenges? I feel like I need someone who gets both aspects of what we''re dealing with. Also, how do you maintain hope when everything feels so uncertain?', 
'mental_health', ARRAY['therapy', 'mental_health', 'mflc', 'support'], 42, 25, true, false, '2024-07-28 10:30:00', '2024-07-28 10:30:00'),

-- Post 7: Success story and encouragement
('660e8400-e29b-41d4-a716-446655440007', NULL, 'Finally Pregnant After 4 Years - Don''t Give Up!', 
'I wanted to share some hope with this community that has supported me through the darkest times. After 4 years, 3 IVF cycles, 2 miscarriages, and countless tears, I''m finally 20 weeks pregnant with a healthy baby girl! The journey was brutal - especially managing treatments during my husband''s back-to-back deployments. There were times I wanted to give up, but this community kept me going. To everyone still fighting: your story isn''t over. Every cycle teaches the doctors something new about your body. Trust the process, advocate for yourselves, and lean on each other. Sending love and baby dust to all! 💕', 
'success_stories', ARRAY['success', 'pregnancy', 'hope', 'encouragement'], 89, 34, true, false, '2024-07-30 15:45:00', '2024-07-30 15:45:00'),

-- Post 8: Egg freezing for military women
('660e8400-e29b-41d4-a716-446655440008', NULL, 'Egg Freezing - Worth the Investment?', 
'I''m 29 and focused on my military career, but I''m starting to think about fertility preservation. Has anyone done egg freezing while active duty? What was the process like, and how did you manage it with military duties? I''m particularly interested in cost (since Tricare doesn''t cover it) and success rates. Also wondering about storage - what happens if you PCS frequently? Did anyone regret waiting, or regret doing it? Looking for honest experiences to help me decide.', 
'fertility_preservation', ARRAY['egg_freezing', 'career', 'preservation', 'cost'], 33, 21, false, false, '2024-08-01 12:15:00', '2024-08-01 12:15:00'),

-- Post 9: Secondary infertility
('660e8400-e29b-41d4-a716-446655440009', NULL, 'Secondary Infertility - Feeling Guilty', 
'Anyone else dealing with secondary infertility? We have a 4-year-old from our first (easy) pregnancy, but have been trying for #2 for over 2 years with no success. I feel guilty complaining because we already have one child, but the desire for another is so strong. People keep saying "at least you have one" or "maybe you''re meant to have just one." It''s isolating because most fertility support groups focus on primary infertility. The testing shows unexplained infertility, which is frustrating. How do you explain to your child why they can''t have a sibling? Anyone else in this boat?', 
'secondary_infertility', ARRAY['secondary_infertility', 'guilt', 'unexplained', 'support'], 38, 22, false, false, '2024-08-03 14:40:00', '2024-08-03 14:40:00'),

-- Post 10: Financial planning for fertility treatments
('660e8400-e29b-41d4-a716-446655440010', NULL, 'Budgeting for Fertility Treatments - Tips?', 
'The financial aspect of fertility treatments is overwhelming. Even with Tricare covering some costs, we''re looking at thousands in out-of-pocket expenses. Has anyone used military relief societies for fertility-related financial assistance? What about FSA/HSA strategies? We''re considering taking out a loan, but I''m worried about the debt if treatments don''t work. How do you budget for something so uncertain? Any financial planning tips from those who''ve been through this? Also wondering about tax implications of medical expenses.', 
'financial_planning', ARRAY['budgeting', 'costs', 'financial_assistance', 'fsa'], 25, 17, false, false, '2024-08-05 16:25:00', '2024-08-05 16:25:00');

-- Story 7: 2024 Policy Changes Impact
('550e8400-e29b-41d4-a716-446655440007', NULL, 'How the 2024 Policy Changes Saved Our Family', 
'When the DoD updated their fertility policy in March 2024, it literally changed our lives. My wife and I are both active duty, and under the old policy, we wouldn''t have qualified for IVF because we needed donor sperm. The previous policy only covered married couples who could both produce gametes, which excluded us as a same-sex couple. The March 8, 2024 amendment removed those restrictions and now allows donor gametes at no cost to DoD. We started our first IVF cycle in May 2024, and I''m happy to report my wife is now 12 weeks pregnant with twins! The process was still challenging - coordinating treatments around both our duty schedules, managing the emotional ups and downs, and navigating the paperwork. But having Tricare coverage made it financially possible. For couples who were previously excluded, I encourage you to speak with your MTF about the new eligibility criteria. The policy change specifically states that treatment is available regardless of marital status or need for donor materials.', 
'public', false, 'Army', 'success_story', 'grateful', '2024-08-10 10:15:00', '2024-08-11 09:30:00'),

-- Story 8: VA Benefits for Veterans
('550e8400-e29b-41d4-a716-446655440008', NULL, 'Transitioning from Active Duty to VA Fertility Care', 
'After my medical retirement from the Marines due to a service-connected injury, I was worried about continuing fertility treatments through the VA. My wife and I had started IVF while I was active duty, but I separated before we could complete our cycles. The good news is that the VA updated their policy in March 2024 to align with DoD changes. According to VA Instruction 01-24, veterans with service-connected disabilities that result in inability to procreate are eligible for assisted reproductive technology, including IVF. The key is proving that your service-connected condition directly impacts fertility. In my case, my injury affected hormone production. The VA fertility team was knowledgeable about the new guidelines and helped us navigate the eligibility requirements. We''re now in our second VA-covered IVF cycle. The transition from military to veteran healthcare for fertility was smoother than expected, thanks to the policy alignment. Veterans dealing with service-connected fertility issues should definitely explore these benefits.', 
'public', false, 'Marine Corps', 'informational_story', 'hopeful', '2024-08-15 14:45:00', '2024-08-16 11:20:00'),

-- Story 9: Single Service Member Egg Freezing
('550e8400-e29b-41d4-a716-446655440009', NULL, 'Single and Preserving My Options', 
'As a single Air Force officer, I never thought fertility preservation would apply to me. But after learning about the 2024 policy changes that expanded coverage to unmarried service members, I decided to explore egg freezing. The new DoD policy removed the marriage requirement, which was huge for me. At 32, I''m focused on my career but want to keep my options open for the future. The process took about 3 weeks from start to finish - daily hormone injections, frequent monitoring appointments, and finally the retrieval procedure. My command was incredibly supportive once I explained it was a covered medical procedure. The hardest part was managing the side effects while maintaining my flight status, but medical cleared me throughout the process. I was able to freeze 22 eggs, giving me peace of mind about my future family planning. The policy change recognizes that not everyone is ready for children during their prime fertility years, especially in demanding military careers. I''d encourage any single service members to consider their options while the coverage is available.', 
'public', false, 'Air Force', 'preventive_story', 'empowered', '2024-08-20 16:30:00', '2024-08-21 13:15:00');

-- Additional Community Posts with 2024 Policy Information
INSERT INTO community_posts (id, user_id, title, content, category, tags, likes_count, replies_count, is_pinned, is_moderated, created_at, updated_at) VALUES

-- Post 11: 2024 Policy Changes Explanation
('660e8400-e29b-41d4-a716-446655440011', NULL, 'OFFICIAL: 2024 DoD Fertility Policy Changes Explained', 
'For those asking about recent policy changes, here''s what changed with the March 8, 2024 DoD update:\n\n✅ Marriage requirement REMOVED - single service members now eligible\n✅ Donor gametes (eggs/sperm) now allowed at no cost to DoD\n✅ Donor embryos explicitly permitted\n✅ Same-sex couples now fully covered\n\nThe VA also updated their policy (Instruction 01-24, March 28, 2024) to align with DoD changes. This means veterans with service-connected fertility issues have the same expanded access.\n\nKey eligibility remains: Category II or III seriously/severely ill/injured status, or service-connected disability affecting fertility.\n\nIf you were previously denied coverage, it might be worth reapplying under the new criteria. The Federal Register published the full details on April 4, 2024.\n\nSources: DoD Policy Amendment March 8, 2024; VA Instruction 01-24', 
'policy_updates', ARRAY['policy', '2024_changes', 'eligibility', 'official'], 156, 43, true, false, '2024-08-25 09:00:00', '2024-08-25 09:00:00'),

-- Post 12: VA vs Active Duty Coverage
('660e8400-e29b-41d4-a716-446655440012', NULL, 'VA Fertility Benefits - What Veterans Need to Know', 
'Transitioning from active duty to veteran status and wondering about fertility coverage? Here''s what I learned:\n\nVA covers ART (including IVF) if your service-connected disability "results in the inability to procreate without fertility treatment." The key is establishing that connection between your service-connected condition and fertility issues.\n\nUnlike Tricare, VA coverage isn''t limited to Category II/III injuries. Any service-connected disability that impacts fertility can qualify you. This could include:\n- Hormonal disruptions from TBI\n- Medication side effects from service-connected conditions\n- Physical injuries affecting reproductive organs\n- PTSD medications impacting fertility\n\nThe process involves working with VA Women''s Health or Men''s Health clinics to document the connection. They''ll coordinate with fertility specialists and handle prior authorizations.\n\nDon''t assume you''re not covered - the 2024 policy expansion significantly broadened eligibility. Worth exploring if you''re struggling with fertility as a veteran.', 
'veterans_benefits', ARRAY['va_benefits', 'veterans', 'service_connected', 'coverage'], 78, 29, false, false, '2024-08-28 11:30:00', '2024-08-28 11:30:00'),

-- Post 13: Donor Gamete Experiences
('660e8400-e29b-41d4-a716-446655440013', NULL, 'Using Donor Sperm - New Policy Made It Possible', 
'The 2024 policy change allowing donor gametes was a game-changer for us. My husband''s service-connected injury resulted in azoospermia (no sperm production), and under the old policy, we would have had to pay out-of-pocket for donor sperm - about $800-1200 per vial plus shipping.\n\nNow it''s covered! The process involves:\n1. Medical documentation of need for donor gametes\n2. Counseling (required for all donor procedures)\n3. Selection from approved sperm banks\n4. Coordination with your fertility clinic\n\nThe emotional aspect was harder than expected. Grieving the loss of biological connection while being grateful for the opportunity. Counseling really helped us process these feelings.\n\nWe''re now 16 weeks pregnant with our first baby. The policy change literally made our family possible. Happy to answer questions about the donor process for anyone considering this path.', 
'donor_gametes', ARRAY['donor_sperm', 'policy_change', 'azoospermia', 'success'], 67, 31, false, false, '2024-09-02 15:20:00', '2024-09-02 15:20:00'),

-- Post 14: Single Service Member Support
('660e8400-e29b-41d4-a716-446655440014', NULL, 'Single Service Members - You''re Not Alone', 
'Creating a support thread for single service members navigating fertility preservation or treatment. The 2024 policy changes opened doors for us, but the journey can feel isolating when most resources focus on couples.\n\nWhether you''re:\n🥚 Considering egg/sperm freezing\n👶 Single and wanting to start a family\n💔 Dealing with fertility issues without a partner\n🏳️‍🌈 LGBTQ+ and exploring options\n\nYou belong here. The military community is evolving to support all family structures.\n\nShare your experiences, questions, or just need someone to listen. We''ve got each other''s backs.\n\nReminder: The new policy covers fertility preservation and treatment regardless of marital status. Don''t let outdated information stop you from exploring your options.', 
'single_service_members', ARRAY['single', 'support', 'lgbtq', 'community'], 94, 38, true, false, '2024-09-05 13:45:00', '2024-09-05 13:45:00'),

-- Post 15: Financial Impact of Policy Changes
('660e8400-e29b-41d4-a716-446655440015', NULL, 'How Much Money Did the 2024 Changes Save You?', 
'Curious about the financial impact of the policy changes. Before March 2024, many of us were paying thousands out-of-pocket for things now covered:\n\n💰 Donor sperm: $800-1200/vial (I needed 3 vials)\n💰 Donor eggs: $8000-15000/cycle\n💰 Single coverage: Full IVF cost $15000-20000\n\nFor my family, the policy change saved us approximately $18,000. We were quoted $3,600 for donor sperm across multiple cycles, plus all the IVF costs since we weren''t married at the time.\n\nNow everything is covered under our standard Tricare cost-sharing. The financial stress was almost as bad as the emotional stress, so this change has been life-changing.\n\nWhat''s your story? How much did the policy changes save your family? Let''s document the real impact of these updates.', 
'financial_impact', ARRAY['cost_savings', 'policy_impact', 'financial', 'donor_costs'], 52, 24, false, false, '2024-09-08 10:10:00', '2024-09-08 10:10:00');

-- Update the sequences to avoid conflicts
SELECT setval('stories_id_seq', (SELECT MAX(id::int) FROM stories WHERE id ~ '^[0-9]+$') + 1, false);
SELECT setval('community_posts_id_seq', (SELECT MAX(id::int) FROM community_posts WHERE id ~ '^[0-9]+$') + 1, false);