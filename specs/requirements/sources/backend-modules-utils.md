# backend/modules/utils

- utils.bal:14 (isMarketingEvent): an engagement is a marketing event when its type is the event type → F2
- utils.bal:22 (isInternalEng): an engagement is internal when its type is internal engagement or marketing event → F2, F4
- utils.bal:62-68 (isDefaultAllocation): a default allocation is one whose engagement id is the no-engagement sentinel, accepted as int, float or either's string form; the webapp uses the same sentinel → F5
- utils.bal:70-76 (isTravelExpected): an engagement's nature implies travel when, trimmed and lower-cased, it is one of the travel-expected natures → F3
- utils.bal:83-90 (filterRecipients): drops empty and suppressed addresses, removes duplicates within each list, and drops any CC address already in To so nobody is addressed twice → not used: how it is built
- utils.bal:96-119 (filterRecipients): trims each address; suppression and de-duplication are case-insensitive → not used: how it is built
- tests/recipients\_test.bal:13-102: pins order preserved, duplicates and blanks dropped, whitespace trimmed, CC already in To dropped, suppression case-insensitive on both lists, and a fully suppressed list yielding an empty To → not used: test scaffolding
- tests/recipients\_test.bal:24-25: the acting user is appended unconditionally, which once produced the same address twice when they were already a recipient → not used: test scaffolding
- tests/recipients\_test.bal:104-125: pins that physical and hybrid events and on-site engagements expect travel, while virtual, off-site, empty and unknown natures do not, ignoring case and surrounding whitespace → F3