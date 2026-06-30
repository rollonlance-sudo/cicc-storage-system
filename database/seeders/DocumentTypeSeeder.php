<?php

namespace Database\Seeders;

use App\Models\DocumentCategory;
use App\Models\DocumentType;
use Illuminate\Database\Seeder;

/**
 * Seeds the standard government-style paper/document types and derives their
 * categories. Categories are created in first-appearance order; every type is
 * keyed on its unique `code`, so re-running this seeder is idempotent and will
 * refresh names/descriptions without creating duplicates.
 */
class DocumentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $categoryIds = [];
        $categoryOrder = 0;
        $typeOrder = 0;

        foreach ($this->documentTypes() as [$code, $name, $categoryName, $description]) {
            // Resolve (creating on first appearance) the category for this type.
            if (! isset($categoryIds[$categoryName])) {
                $categoryOrder++;
                $category = DocumentCategory::withTrashed()->updateOrCreate(
                    ['name' => $categoryName],
                    [
                        'is_active' => true,
                        'sort_order' => $categoryOrder,
                        'deleted_at' => null,
                    ],
                );
                $categoryIds[$categoryName] = $category->id;
            }

            $typeOrder++;
            DocumentType::withTrashed()->updateOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'document_category_id' => $categoryIds[$categoryName],
                    'description' => $description,
                    'is_active' => true,
                    'sort_order' => $typeOrder,
                    'deleted_at' => null,
                ],
            );
        }
    }

    /**
     * The standard seed list: [code, full name, category, description].
     *
     * @return list<array{0:string,1:string,2:string,3:string}>
     */
    private function documentTypes(): array
    {
        return [
            ['NoM', 'Notice of Meeting', 'Meeting Document',
                'Formal notice informing participants about a scheduled meeting.'],
            ['MoM', 'Minutes of Meeting', 'Meeting Document',
                'Official written record of discussions, decisions, and action items from a meeting.'],
            ['TOR', 'Terms of Reference', 'Procurement / Project Document',
                'Defines the purpose, scope, requirements, deliverables, and responsibilities for a project, procurement, or engagement.'],
            ['AD', 'Activity Design', 'Program / Activity Document',
                'Document describing the rationale, objectives, schedule, participants, budget, and expected outputs of an activity.'],
            ['PR', 'Purchase Request', 'Procurement Document',
                'Request document used to initiate the procurement of goods, supplies, services, or equipment.'],
            ['MSF', 'Market Scoping Form', 'Procurement Document',
                'Document used to gather and record market information before procurement planning.'],
            ['JUST', 'Justification', 'Supporting Document',
                'Written explanation supporting the need, purpose, basis, or reason for a request, procurement, activity, or decision.'],
            ['CBA', 'Cost Benefit Analysis', 'Supporting / Evaluation Document',
                'Analysis comparing expected costs and benefits to support decision-making.'],
            ['TS', 'Technical Specifications', 'Procurement Document',
                'Detailed technical requirements, standards, features, materials, quantities, or performance specifications for goods or services.'],
            ['SoC', 'Summary of Canvass', 'Procurement Document',
                'Summary of canvass results or supplier quotations gathered for procurement evaluation.'],
            ['AoC', 'Abstract of Canvass', 'Procurement Document',
                'Comparative abstract or tabulation of quotations, canvass results, or supplier offers.'],
            ['PPMP', 'Project Procurement Management Plan', 'Procurement Planning Document',
                'Procurement planning document prepared by an end-user or implementing unit for specific programs, projects, activities, goods, or services.'],
            ['AWFP', 'Annual Work and Financial Plan', 'Planning / Budget Document',
                'Annual plan showing programmed work activities, targets, funding requirements, and financial requirements.'],
            ['APP', 'Annual Procurement Plan', 'Procurement Planning Document',
                'Consolidated annual procurement plan of the agency or office based on approved PPMPs.'],
            ['PAP-PF', 'Programs/Activities/Projects Profile Form', 'Planning / Budget Document',
                'Profile form containing details of a program, activity, or project, including objectives, beneficiaries, cost, timeline, and implementation details.'],
            ['BAR-1', 'Budget Accountability Report No. 1 / Quarterly Physical Report of Operations', 'Budget Accountability Report',
                'Report showing physical targets and accomplishments of an office, program, activity, or project for a reporting period.'],
            ['IPCR', 'Individual Performance Commitment and Review', 'Performance Management Document',
                'Performance commitment and review document for an individual employee.'],
            ['DPCR', 'Division Performance Commitment and Review', 'Performance Management Document',
                'Performance commitment and review document for a division or unit.'],
            ['OPCR', 'Office Performance Commitment and Review', 'Performance Management Document',
                'Performance commitment and review document for an office.'],
            ['ORS', 'Obligation Request and Status', 'Budget / Accounting Document',
                'Document used to record, certify, and track obligations against available allotment or budget.'],
            ['DV', 'Disbursement Voucher', 'Accounting / Payment Document',
                'Payment document used to process disbursements and support claims for payment.'],
            ['LDDAP-ADA', 'List of Due and Demandable Accounts Payable - Advice to Debit Account', 'Accounting / Payment Document',
                'Government payment document used to list payable accounts and authorize debit from an agency account.'],
            ['TO', 'Travel Order', 'Administrative Document',
                'Official order authorizing an employee or personnel to travel for official business.'],
            ['SO', 'Special Order', 'Administrative Issuance',
                'Official order issued for a specific assignment, designation, authority, activity, or administrative action.'],
            ['PAR', 'Post Activity Report', 'Program / Activity Report',
                'Report prepared after an activity, summarizing actual implementation, participants, outputs, issues, expenses, and recommendations.'],
            ['IAR', 'Inspection and Acceptance Report', 'Procurement / Supply Document',
                'Document recording inspection and acceptance of delivered goods, supplies, equipment, or services.'],
            ['CAC', 'Certificate of Acceptance and Completion', 'Completion / Acceptance Document',
                'Certification that goods, services, works, or deliverables have been completed and accepted.'],
            ['SEB', 'Summary of Expenses / Bills', 'Financial Supporting Document',
                'Summary listing expenses, bills, claims, or charges related to an activity, procurement, travel, service, or transaction.'],
        ];
    }
}
